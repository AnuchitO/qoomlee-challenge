package middleware_test

import (
	"crypto/rand"
	"crypto/rsa"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"

	"github.com/AnuchitO/qoomlee/middleware"
)

func makeTestKeys(t *testing.T) (*rsa.PrivateKey, *rsa.PublicKey) {
	t.Helper()
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("generate RSA key: %v", err)
	}
	return priv, &priv.PublicKey
}

func signRS256(t *testing.T, priv *rsa.PrivateKey, claims jwt.Claims) string {
	t.Helper()
	tok, err := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(priv)
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return tok
}

func callJWT(handler gin.HandlerFunc, token string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/flights/search", nil)
	if token != "" {
		c.Request.Header.Set("Authorization", "Bearer "+token)
	}
	handler(c)
	return w
}

func TestJWTAuth(t *testing.T) {
	priv, pub := makeTestKeys(t)

	t.Run("valid RS256 token is accepted", func(t *testing.T) {
		claims := jwt.RegisteredClaims{
			Subject:   "user-123",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		}
		token := signRS256(t, priv, claims)
		w := callJWT(middleware.JWTAuth(pub), token)
		assert.NotEqual(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("missing Authorization header returns 401", func(t *testing.T) {
		w := callJWT(middleware.JWTAuth(pub), "")
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("malformed token returns 401", func(t *testing.T) {
		w := callJWT(middleware.JWTAuth(pub), "not.a.jwt")
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("expired token returns 401", func(t *testing.T) {
		claims := jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
		}
		token := signRS256(t, priv, claims)
		w := callJWT(middleware.JWTAuth(pub), token)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("HMAC-signed token (wrong algorithm) returns 401", func(t *testing.T) {
		tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		})
		token, _ := tok.SignedString([]byte("hmac-secret"))
		w := callJWT(middleware.JWTAuth(pub), token)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
