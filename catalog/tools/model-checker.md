---
title: Model checker
summary: Explores every reachable state of a formal model within set bounds, checks the stated properties in each, and prints a trace to any state that breaks one.
sensors: [model-check]
layer: project
vendors:
  - name: TLC
    url: https://github.com/tlaplus/tlaplus
    note: TLA+
  - name: Apalache
    url: https://apalache-mc.org/
    note: TLA+, by constraint solving
  - name: Alloy Analyzer
    url: https://alloytools.org/
    note: Alloy
  - name: SPIN
    url: https://spinroot.com/
    note: Promela
---

A model checker runs a formal model instead of the code: it starts from each initial state, takes every step the model
allows, and checks the properties in every state it reaches. The model is written in a modelling language such as TLA+
or Alloy, and each language has its own checkers. It is for one critical part, such as credits and subscriptions or a
protocol between services, never for the whole product.

## Finding it

- **The models**: `.tla` files, which hold TLA+ models, with their `.cfg` files (the configuration for TLC, the
  standard TLA+ checker: the constants, and the invariants and properties to check), or `.als` files for Alloy. Often
  in a `specs/` or `models/` folder.
- **CI or the task file**: the job or task that runs the checker on the models.
- **Its runtime**: TLC comes in `tla2tools.jar` and needs Java; Apalache, another checker for TLA+, has its own
  command; the Alloy Analyzer is a Java application.

When the project has none, writing a model is a decision for a person. A model costs time to write and to keep up with
the design, and it pays off only where several operations change the same counters at once, or where rules interact.
First try an example in the project's spec that shows two such operations racing; write a model only when that
example is not enough.

## Using it

- **Run it**: `java -cp tla2tools.jar tlc2.TLC -config Spec.cfg Spec.tla` for TLC;
  `apalache-mc check --inv=Inv --length=10 Spec.tla` for Apalache, which checks runs of up to that many steps; a
  `check <assertion> for <scope>` command in the model for Alloy.
- **Keep the bounds small, and state them with every result**: small sets of model values for the constants in TLC
  (two users, three requests), `--length` in Apalache, the scope and the `steps` in Alloy.
- **Make an undecided rule a constant**, so that one run covers each variant of the rule, and the result shows which
  variants break a property.
- **Show it catches a broken model**: remove a guard, such as the balance check, and the run must find a trace. A
  property that never fires on a broken model checks nothing.
- **Turn each counterexample into a test** of the code, usually at the API. The counterexample is the trace the run
  prints; read it first, and when it comes from a wrong property, fix the property instead. A change it forces in a
  business rule goes into the project's spec as a rule, or as a question for a person when nobody has decided it.
- **Run it in CI on every change to the model**, with a time limit, since a run can take far longer than expected.
