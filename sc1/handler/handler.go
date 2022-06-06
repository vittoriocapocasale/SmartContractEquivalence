package handler

import (
	"bytes"
	"fmt"
	"strconv"

	"github.com/hyperledger/sawtooth-sdk-go/logging"
	"github.com/hyperledger/sawtooth-sdk-go/processor"
	"github.com/hyperledger/sawtooth-sdk-go/protobuf/processor_pb2"
	"github.com/vittoriocapocasale/doublesc_tp/sc1/cbor"
	"github.com/vittoriocapocasale/doublesc_tp/sc1/hash"
	"github.com/vittoriocapocasale/doublesc_tp/sc1/payload"
)

const (
	FAMILY_NAME    = "ADDER"
	FAMILY_VERSION = "1.0"
	FAMILY_PREFIX  = "000001"
)

var logger *logging.Logger = logging.Get()

type SC1Handler struct{}

func NewSC1Handler() *SC1Handler {
	return &SC1Handler{}
}

func (self *SC1Handler) FamilyName() string {
	return FAMILY_NAME
}

func (self *SC1Handler) FamilyVersions() []string {
	return []string{FAMILY_VERSION}
}

func (self *SC1Handler) Namespaces() []string {
	return []string{FAMILY_PREFIX}
}

func (self *SC1Handler) Apply(request *processor_pb2.TpProcessRequest, context *processor.Context) error {

	payloadData := request.GetPayload()
	if payloadData == nil {
		return &processor.InvalidTransactionError{Msg: "Must contain payload"}
	}
	//retrive the "kind" of transaction by reading only the "action" of payload

	var payload payload.GenericPayload
	err := cbor.DecodeCbor(payloadData, &payload)
	if err != nil {
		return &processor.InvalidTransactionError{Msg: fmt.Sprint("Failed to decode payload: ", err)}
	}
	switch payload.Action {
	case "Reset":

		buffer := new(bytes.Buffer)
		err := cbor.EncodeCbor(payload.Quantity, buffer)
		if err != nil {
			return &processor.InternalError{Msg: fmt.Sprint("Failed to encode", err)}
		}
		hashv := hash.Hexdigest(payload.Identifier)
		address := FAMILY_PREFIX + hashv[len(hashv)-64:]
		addresses, err := context.SetState(map[string][]byte{
			address: buffer.Bytes(),
		})
		if err != nil {
			return &processor.InternalError{Msg: fmt.Sprint("Failed to store", err)}
		}
		if len(addresses) == 0 {
			return &processor.InternalError{Msg: "No addresses in set response"}
		}
		attributes := make([]processor.Attribute, 1)
		attributes = append(attributes, processor.Attribute{Key: payload.Identifier, Value: strconv.FormatUint(uint64(payload.Quantity), 10)})
		var empty []byte
		context.AddEvent("ADDER/adder", attributes, empty)
		return nil
	case "Add":
		hashv := hash.Hexdigest(payload.Identifier)
		address := FAMILY_PREFIX + hashv[len(hashv)-64:]
		results, err := context.GetState([]string{address})
		if err != nil {
			return &processor.InternalError{Msg: fmt.Sprint("Failed to load", err)}
		}
		data, exists := results[address]
		var storedAddend uint32
		if exists && len(data) > 0 {
			err = cbor.DecodeCbor(data, &storedAddend)
			if err != nil {
				return &processor.InternalError{Msg: fmt.Sprint("Failed to decode", err)}
			}
		}
		sum := storedAddend
		var i uint32
		for i = 0; i < payload.Quantity; i++ {
			sum = sum + 1
		}
		buffer := new(bytes.Buffer)
		err = cbor.EncodeCbor(&sum, buffer)
		if err != nil {
			return &processor.InternalError{Msg: fmt.Sprint("Failed to encode", err)}
		}
		addresses, err := context.SetState(map[string][]byte{
			address: buffer.Bytes(),
		})
		if err != nil {
			return &processor.InternalError{Msg: fmt.Sprint("Failed to store", err)}
		}
		if len(addresses) == 0 {
			return &processor.InternalError{Msg: "No addresses in set response"}
		}
		attributes := make([]processor.Attribute, 1)
		attributes = append(attributes, processor.Attribute{Key: payload.Identifier, Value: strconv.FormatUint(uint64(sum), 10)})
		var empty []byte
		context.AddEvent("ADDER/adder", attributes, empty)
		return nil
	default:
		return &processor.InvalidTransactionError{Msg: "Action unknown"}
	}
}
