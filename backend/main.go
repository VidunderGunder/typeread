package main

import (
	"typeread/api"
	"typeread/auth"
)

func main() {
	auth.Init()
	api.Serve()
}
