# Smart Contract Equivalence
Rurnning: 

On a first terminal:

```console
docker-compose -f compose-pbft.yaml up
```

On a second terminal:

```console
docker-compose -f client.yaml up
```


The client installs the node modules (it might take a while), then submits two transactions:

- a reset transaction that initialize an address to 0

- an add transaction that adds 5 to the initial 0

The sum operation is performed as oldValue+5 by validators 2,3,4

The sum operation is performed as oldValue + 1 (repeat 5 times) by validators 0,1

Thus, two different implementations of the same smart contract are used simultaneously.

The client queries validator 0 and 4 to show the transaction processing coherence of two validators running different implementations



