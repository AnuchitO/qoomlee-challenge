package flight

import (
	"context"
	"database/sql"
	"errors"
)

func (r *repository) GetByID(ctx context.Context, id int64) (*Flight, error) {
	q := selectFlightCols + `
	FROM flights f
	JOIN routes r ON r.id = f.route_id
	WHERE f.id = $1`

	var f Flight
	err := scanFlight(r.db.QueryRowContext(ctx, q, id), &f)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &f, nil
}
