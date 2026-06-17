//go:build integration

package booking

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"time"

	_ "github.com/lib/pq"
	tc "github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	"testing"
)

// sharedDB is initialised once in TestMain and reused across all integration tests.
var sharedDB *sql.DB

// TestMain starts a single PostgreSQL container for the whole integration test run,
// applies schema + seed, then tears everything down after all tests finish.
func TestMain(m *testing.M) {
	ctx := context.Background()

	schemaPath, err := filepath.Abs("../../../infra/db/qoomlee/01_schema.sql")
	if err != nil {
		panic("resolve schema path: " + err.Error())
	}
	seedPath, err := filepath.Abs("../../../infra/db/qoomlee/02_seed.sql")
	if err != nil {
		panic("resolve seed path: " + err.Error())
	}

	pgc, err := postgres.Run(ctx,
		"postgres:16-alpine",
		tc.WithEnv(map[string]string{"TZ": "Asia/Bangkok"}),
		postgres.WithDatabase("qoomlee"),
		postgres.WithUsername("qoomlee"),
		postgres.WithPassword("qoomlee"),
		postgres.WithInitScripts(schemaPath, seedPath),
		tc.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(90*time.Second),
		),
	)
	if err != nil {
		panic("start postgres container: " + err.Error())
	}
	defer func() { _ = pgc.Terminate(ctx) }()

	connStr, err := pgc.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		panic("get connection string: " + err.Error())
	}

	sharedDB, err = sql.Open("postgres", connStr)
	if err != nil {
		panic("open db: " + err.Error())
	}
	defer func() { _ = sharedDB.Close() }()

	os.Exit(m.Run())
}
