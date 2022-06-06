module.exports = {
    Payload: class{
      constructor(action, id, quantity) {
        this.Action=action;
        this.Identifier = id;
        this.Quantity = quantity;
      }
    }
  };