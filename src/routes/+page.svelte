<script lang="ts">
	import { objectValues } from '$lib/objectUtils';
	import { data$ } from '$lib/dataObservables';
	import {  subscribeToCurrency } from '$lib/ws';

	subscribeToCurrency('XBTUSD');
	const sell = $derived(objectValues($data$).filter(d=>d.side==="Sell").sort((a,b)=>b.price - a.price)
	.slice(-9).map((d, i, arr)=>{ 
		const totalSize = arr.slice(i-arr.length).reduce((acc,cur)=>acc+cur.size, 0) 
		return {...d, totalSize}}));
	const buy = $derived(objectValues($data$).filter(d=>d.side==="Buy").sort((a,b)=>b.price - a.price).slice(0,9)
	.map((d, i, arr)=>{ 
		const totalSize = arr.slice(0, i + 1).reduce((acc,cur)=>acc+cur.size, 0) 
		return {...d, totalSize}}));

	const nFormat = new Intl.NumberFormat(undefined, {minimumFractionDigits: 2});

</script>
<div class="order-book">
<h1>Order Book</h1>

<div class="order-book-data">
<div>Price</div><div>Size (USD)</div><div>Total (USD)</div>
</div>
<div class="order-book-data alternate-rows">
	{#each sell as item}
		<div class="sell-price">{nFormat.format(item.price)}</div>
		<div class="size">
			{#key item.size}
			<span class="bar {item.size-(item.prevSize??0)>0?"positive":"negative"}" style="width: {100*Math.abs(item.size-(item.prevSize??0))/Math.max(item.size, item.prevSize??1)}%;"></span>
			{/key}
			<div class="value">{item.size}</div>
		</div>
		<div class="total-size">{item.totalSize}</div>
	{/each}
</div>
<div >-----</div>
<div class="order-book-data alternate-rows">

	{#each buy as item}
		<div class="buy-price">{nFormat.format(item.price)}</div>
		<div class="size">
			{#key item.size}
			<span class="bar {item.size-(item.prevSize??0)>0?"positive":"negative"}" style="width: {100*Math.abs(item.size-(item.prevSize??0))/Math.max(item.size, item.prevSize??1)}%;"></span>
			{/key}
			<div class="value">{item.size}</div>
		</div>
		<div class="total-size">{item.totalSize}</div>
	{/each}
</div>
</div>

<style>
:global(body) {
		background-color: #0F1723;
		color: rgb(255, 255, 255);
	}
.order-book {
	font-family: "Inter", "Open Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
	background-color: #111a24;
	max-width: 320px;
	padding: 10px;
}
.order-book-data{
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	width: 300px;
	
}
 .alternate-rows > div:nth-child(6n + 1),
 .alternate-rows > div:nth-child(6n + 2),
 .alternate-rows > div:nth-child(6n + 3){
		background-color: #ffffff22;
	}
	.sell-price{
		color: rgb(255, 65, 88);
	}
	.buy-price{
		color: rgb(0, 218, 133);
	}

	@keyframes fadeOut {
    0%, 50% {  /* Stay solid for first 50% of animation (0.5s) */
        opacity: 1;
    }
    100% {     /* Then fade to 0 for the remaining 50% */
        opacity: 0;
    }
}

.size{
	position: relative;
}
.size .bar{
	position: absolute;
    right: 2px;
    bottom: 0;
    height: 100%;
    background-color: #0bde5f90;
	z-index: 1;
	animation: fadeOut 0.5s ease-out;
&.positive{
	background-color: #0bde5f90;
}
&.negative{
	background-color: #e00b0b90;
}
}
.size .value {
    position: relative;
    z-index: 2;  
}
.total-size{
	text-align: right;
}
</style>
