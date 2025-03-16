package main

import (
	"typeread/api"

	_ "github.com/danielgtaylor/huma/v2/formats/cbor"
)

func main() {
	api.Serve()
}
