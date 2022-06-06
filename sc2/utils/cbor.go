package utils

import (
	"bufio"
	"bytes"
	"sync"

	"github.com/ugorji/go/codec"
)

var cborHandle *codec.CborHandle
var once sync.Once

func GetCBORHandleInstance() *codec.CborHandle {
	once.Do(func() {
		cborHandle = new(codec.CborHandle)
		cborHandle.Canonical = true
	})
	return cborHandle
}

func EncodeCbor(input interface{}, output *bytes.Buffer) error {
	h := GetCBORHandleInstance()
	var bw = bufio.NewWriter(output)
	enc := codec.NewEncoder(bw, h)
	err := enc.Encode(input)
	bw.Flush()
	return err
}

func DecodeCbor(input []byte, output interface{}) error {
	h := GetCBORHandleInstance()
	var dec *codec.Decoder = codec.NewDecoderBytes(input, h)
	var err error = dec.Decode(output)
	return err
}
