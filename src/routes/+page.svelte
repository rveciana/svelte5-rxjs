<script lang="ts">
	import { objectValues } from '$lib/objectUtils';
	import { data$ } from '$lib/dataObservables';
	import {  subscribeToCurrency } from '$lib/ws';

	subscribeToCurrency('XBTUSD');
	const data = $derived(objectValues($data$).sort((a,b)=>b.price - a.price));
</script>

<h1>Welcome to SvelteKit + Rxjs</h1>

<p>{JSON.stringify(data)}</p>
