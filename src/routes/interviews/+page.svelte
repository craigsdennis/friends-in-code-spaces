<script>
    export let data;
</script>
<style>
    h1 {
        color: #74c991;
    }

    input, button {
        padding: 10px;
        margin: 5px;
    }
    a {
		color: #13a7cd;
        text-decoration: none;
	}
    input {
        background-color: #333;
        border: 1px solid #3c3c3c;
        color: white;
    }

    button {
        background-color: #007acc;
        border: none;
        color: white;
    }

    button:hover {
        background-color: #005a9e;
    }
</style>

<h1>Interviews</h1>

<form method="POST">
    <input name="name" placeholder="Name" />
    <input name="title" placeholder="Title" />
    <input name="company" placeholder="Company" />
    <button>Create new interview</button>
</form>


<ul>
    {#each data.interviews as interview}
        <li><a href="/interviews/{interview.id}">{interview.name}, {interview.title}, @ {interview.company}</a></li>
    {/each}
</ul>