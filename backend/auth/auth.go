package auth

import (
	"log"
	"os"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	key    = "3FF0B401-7E7B-41E0-AE95-5228426CE90C"
	maxAge = 86400 * 30
	isProd = false
)

func Init() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading environment variables")
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(maxAge)
	store.Options.Path = "/"
	store.Options.HttpOnly = true // HttpOnly should always be enabled
	store.Options.Secure = isProd

	gothic.Store = store

	goth.UseProviders(
		google.New(
			os.Getenv("GOOGLE_CLIENT_ID"),
			os.Getenv("GOOGLE_CLIENT_SECRET"),
			"http://localhost:8888/auth/callback?provider=google", // http://localhost:5173/auth/google/callback
		),
	)
}
