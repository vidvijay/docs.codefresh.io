---
title: "Install GitOps with existing Argo CD"
description: "Install GitOps Runtime on cluster with exsiting Argo CD"
group: installation
toc: true
---

If you have a cluster with Argo CD already installed, Codefresh provides an option to install a GitOps Runtime to co-exist with your Argo CD installation.  This way you can extend your environments with Codefresh's GitOps capabilities without having to uninstall Argo CD, and with just a few configuration changes. 

* **Explore Codefresh GitOps**
  Add Codefresh's unique GitOps capabilities and features without having to uninstall or reconfigure existing Argo CD installations.  Explore Codefresh GitOps and its advantages in the context of your current setup. Read about our GitOps offering in [Codefresh for GitOps]({{site.baseurl}}/docs/getting-started/gitops-codefresh/).


* **Gradual migration to GitOps applications**
  Once you have worked with Codefresh GitOps, assess migration impacts and make informed decisions on migrating your Argo CD Applications to Codefresh GitOps.  

  For a smooth shift from Argo CD Applications to Codefresh's GitOps applications, migrate them at your own pace and according to your requirements. Once migrated, view, track, and manage all aspects of the applications in Codefresh.


How do you work with Argo CD and Codefresh GitOps side-by-side?  

In three steps:  
* Prepare the Argo CD cluster for GitOps installation
* Install the GitOps Runtime via Helm
* Migrate Argo CD applications to GitOps


## Prepare the Argo CD cluster for GitOps installation

There are three configuration changes to make _before_ installing GitOps on the cluster:
1. [Switch ownership of Argo project CRDs]({{site.baseurl}}/docs/installation/gitops/hybrid-gitops-helm-installation/#gitops-onlygitops-with-argo-cd-argo-project-crds)
2. [Synchronize Argo CD chart's minor versions]({{site.baseurl}}/docs/installation/gitops/hybrid-gitops-helm-installation/#gitops-with-argo-cd-synchronize-argo-cd-charts-minor-versions)
3. [Set native Argo CD resource tracking to `label`]({{site.baseurl}}/docs/installation/gitops/hybrid-gitops-helm-installation/#gitops-with-argo-cd-set-native-argo-cd-resource-tracking-to-label) 

<!--- ### Switch ownership of Argo project CRDs
If you have Argo project CRDs on your cluster, Codefresh recommends either adopting the CRDs to switch ownership to the GitOps Runtime, or handling the CRDs outside the chart.  
Allowing the GitOps Runtime to manage the CRDs also ensures that the CRDs are automatically upgraded whenever the Runtime is upgraded. 

You have two options to adopt Argo project CRDs:

#### (Recommended) Adopt the Argo project CRDs
You can either adopt all CRDs which is the recommended option, or only Argo Rollout CRDs.

**Option 1: Adopt _all_ CRDs (Recommended)**
Adopting _all CRDs_ switches ownership for them to the Hybrid GitOps Runtime, allowing them to be managed by the GitOps Runtime chart. 
 
* Run this script _before_ installation:
```
curl https://raw.githubusercontent.com/codefresh-io/gitops-runtime-helm/main/scripts/adopt-crds.sh | bash -s <runtime-helm-release name> <runtime-namespace>
```

**Option 2: Adopt only Argo Rollout CRDs**
You can also adopt only those CRDs that apply to Argo Rollouts. Adopting Argo Rollouts CRDs also switches ownership of the Rollout CRDs to the GitOps Runtime, and ensures that there is only one active Argo Rollouts controller active on the cluster with the GitOps Runtime. 

* Run this script _before_ installation:
```
#!/bin/sh
RELEASE=<runtime-helm-release-name>
NAMESPACE=<runtime-namespace>
kubectl label --overwrite crds $(kubectl get crd | grep argoproj.io | awk '{print $1}' | xargs) app.kubernetes.io/managed-by=Helm
kubectl annotate --overwrite crds $(kubectl get crd | grep argoproj.io | awk '{print $1}' | xargs) meta.helm.sh/release-name=$RELEASE
kubectl annotate --overwrite crds $(kubectl get crd | grep argoproj.io | awk '{print $1}' | xargs) meta.helm.sh/release-namespace=$NAMESPACE
``` 

#### Handle Argo project CRDs outside of the chart 
Disable CRD installation under the relevant section for each of the Argo projects in the Helm chart:<br>
  `--set <argo-project>.crds.install=false`<br>
  where:<br>
  `<argo-project>` is the Argo project component: `argo-cd`, `argo-workflows`, `argo-rollouts` and `argo-events`.
 
See [Argo's readme on Helm charts](https://github.com/argoproj/argo-helm/blob/main/README.md){:target="\_blank"}.  



### Synchronize Argo CD chart's minor versions 
To avoid potentially incompatible changes or mismatches, ensure that you use the same upstream chart version of Argo CD as that used by Codefresh.   

1. Go to `https://github.com/codefresh-io/argo-helm/`.
1. Navigate to `<upstream-chart-version>-<codefresh-version id>/charts/argo-cd/Chart.yaml`. For example, `https://github.com/codefresh-io/argo-helm/blob/argo-cd-5.38.1-1-cap-CR-18361/charts/argo-cd/Chart.yaml`.
1. Find the Argo CD chart version that Codefresh uses in `dependencies.version`, as in this example: 

{% include
   image.html
   lightbox="true"
   file="/images/helm-side-by-side-argocd-version.png"
 url="/images/helm-side-by-side-argocd-version.png"
  alt="Getting the Codefresh upstream chart version of Argo CD"
  caption="Getting the Codefresh upstream chart version of Argo CD"
  max-width="60%"
%}



### Set native Argo CD resource tracking to `label` 
When you install GitOps on a cluster with an existing Argo CD installation, ensure that native Argo CD and GitOps Runtime's Argo CD use different methods to track resources. The same tracking method in both Argo CD instances can result in conflicts with the same application names or when tracking the same resource. 

Verify that your native Argo CD instance uses `label` to track resources:
* In the Argo CD namespace, make sure `argocd-cm.application.resourceTrackingMethod` is either not defined, in which case it defaults to `label`, or if defined, is set to `label`. 

-->

## Install Hybrid GitOps Runtime via Helm

After completing the prerequisites, follow our [step-by-step installation guide]({{site.baseurl}}/docs/installation/gitops/hybrid-gitops-helm-installation/#install-first-gitops-runtime-in-account) to install the GitOps Runtime.  

GitOps installation is Helm-based and installing GitOps on a cluster with Argo CD requires additional flags in the installation command and an additional step after installation.


## Migrate Argo CD Applications to Codefresh GitOps
The final task depending on your requirements is to migrate your Argo CD Applications to Codefresh GitOps applications.  

Why would you want to do this?  
Because this allows you to completely and seamlessly manage the applications in Codefresh as GitOps entities.


The process to migrate an Argo CD Application is simple:

### Step 1: Add a Git Source to GitOps Runtime

After installing the GitOps Runtime successfully, you can add a Git Source to the Runtime and commit your applications to it.
A Git Source is a Git repository with an opinionated folder structure managed by Codefresh.
Read about [Git Sources]({{site.baseurl}}/docs/installation/gitops/git-sources/).



* Add a [Git Source]({{site.baseurl}}/docs/installation/gitops/git-sources/#create-a-git-source) to your GitOps Runtime.

### Step 2: Modify Argo CD Application

In this step, you'll modify the Argo CD Application's manifest to remove `finalizers`, if any, and also remove the Application from the `argocd` `namespace` it is assigned to by default.

Here's an example of a manifest for an Argo CD Application with `finalizers`.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-sample-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  destination:
    namespace: my-app
    server: https://kubernetes.default.svc
  source:
    repoURL: https://github.com/companyhall/sample-apps.git
    targetRevision: main  
  project: default  # Replace 'default' with the name of the Argo CD project you want to use
```

* Remove `metadata.namespace: argocd`.
* Remove `metadata.finalizers`.



### Step 3: Commit the application to the Git Source
As the final step in migrating your Argo CD Application to a Codefresh GitOps one, you'll manually commit the updated Application manifest to the Git Source you created in Step 1.
Once you commit the manifest to the Git Source, it becomes a GitOps application. You can view it in the Codefresh UI, modify definitions, track it through our different dashboards - in short, manage it as would any GitOps resource in Codefresh. 

1. Go to the Git repo where you created the Git Source.
1. Add and commit the Argo CD Application manifest.


## Related articles
[Creating GitOps applications]({{site.baseurl}}/docs/deployments/gitops/create-application)  
[Monitoring GitOps applications]({{site.baseurl}}/docs/deployments/gitops/applications-dashboard)  
[Managing GitOps applications]({{site.baseurl}}/docs/deployments/gitops/manage-application)  
[Home Dashboard]({{site.baseurl}}/docs/dashboards/home-dashboard)  
[DORA metrics]({{site.baseurl}}/docs/dashboards/dora-metrics/)  