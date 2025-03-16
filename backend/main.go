package main

import (
	"typeread/api"
	"typeread/db"

	_ "github.com/danielgtaylor/huma/v2/formats/cbor"
)

func main() {
	db.Example()
	api.Serve()
}
