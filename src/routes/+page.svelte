<script lang="ts">
	import {  subject$, subscribeToCurrency } from "$lib/ws";

	subscribeToCurrency("XBTUSD")

const test = $derived($subject$)



</script>
<h1>Welcome to SvelteKit + Rxjs</h1>

<p>{JSON.stringify(test)}</p>