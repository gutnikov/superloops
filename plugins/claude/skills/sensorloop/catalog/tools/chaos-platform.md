---
title: Chaos platform
summary: Injects failures into a running environment (processes killed, network delayed, resources exhausted) while checking that it stays healthy.
sensors: [input-fault-injection]
layer: system
vendors:
  - name: Chaos Mesh
    url: https://chaos-mesh.org/
    note: Kubernetes
  - name: LitmusChaos
    url: https://litmuschaos.io/
    note: Kubernetes
  - name: AWS Fault Injection Service
    url: https://aws.amazon.com/fis/
    note: AWS
  - name: Azure Chaos Studio
    url: https://azure.microsoft.com/en-us/products/chaos-studio
    note: Azure
  - name: Gremlin
    url: https://www.gremlin.com/
    note: a hosted service, for several platforms
  - name: Chaos Toolkit
    url: https://chaostoolkit.org/
    note: experiments as files, with drivers for several platforms
---

A chaos platform runs experiments on a running environment: it kills processes, delays the network or exhausts a
resource, and watches whether the system stays healthy. It is installed on the infrastructure the environment runs
on, such as a Kubernetes cluster or a cloud account: look for it there, and do not assume one.

## Finding it

- **On Kubernetes**: the chaos platform's own resource kinds (`PodChaos` and `NetworkChaos` for Chaos Mesh,
  `ChaosEngine` for LitmusChaos), which `kubectl get crd` lists.
- **In a cloud account**: the provider's fault service and its experiment templates.
- **Experiments in the repository**, as manifests beside the deployment config. Apply them with credentials that
  reach staging only.

When there is none, ask a person: installing a chaos platform changes a shared environment, and its owners decide.

## Using it

- **Define the steady state first**: the normal values of a few metrics (the error rate, the latency). Check that it
  holds before the experiment starts.
- **Run on staging only, under load**, and only after the people who own staging have agreed.
- **Give every experiment abort conditions and a duration**, so it stops itself when the steady state breaks.
- **Start small** (one pod, one dependency), and widen the blast radius, the part of the system a fault reaches, only
  after the steady state holds.
