<template>
  <b-container id="pricing">
    <h3 class="display-4 text-center pt-5 pb-4">Pricing</h3>

    <b-row align-v="center">
      <b-col>
        <p class="lead text-center pb-5">Made with open-source software spirit, Open-API are free for non-profit OSS projets, whithout limitation.<br>
        <a href="mailto:contact@multicycles.org">Contact us</a> for business projects. We can develop specific providers, use Open-API on premise.
        </p>
      </b-col>
    </b-row>


    <b-card-group deck class="mb-3 text-center">
      <b-card header="Free" header-class="display-4">
        <h1 class="card-title pricing-card-title">$0 <small class="text-muted">/ mo</small></h1>
        <p>For non-profit projects</p>
        <ul class="list-unstyled mt-3 mb-4">
          <li>All providers</li>
          <li>Unlimited requests</li>
          <li>Basic support</li>
          <li>Require attribution badge</li>
        </ul>

        <b-button slot="footer" size="lg" variant="primary" href="/login">Sign up</b-button>
      </b-card>
      <b-card header="Enterprise" header-class="display-4">
        <h1 class="card-title pricing-card-title">Contact us</h1>
        <p>For business projects.</p>
        <ul class="list-unstyled mt-3 mb-4">
          <li>All providers</li>
          <li>Unlimited requests</li>
          <li>Premium support</li>
        </ul>

        <b-button slot="footer" size="lg" variant="outline-primary" href="mailto:contact@multicycles.org">Contact us</b-button>
      </b-card>
    </b-card-group>
  </b-container>
</template>
