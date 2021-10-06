# PodcastIndexJS

PodcastIndexJS is a client-side javascript library to use the Podcast Index API <https://podcastindex.org/>. This library was adapted from the Node package <https://github.com/RyanHirsch/podcastdx-client>, in order for use on the client-side.

To use the Podcast Index API, you must register for a developer `API KEY` and `API SECRET` from <https://api.podcastindex.org/signup>.

## Documentation

All available methods/types can be viewed at <https://jasonobeid.github.io/PodcastIndexJS/classes/index.PodcastIndexClient.html>.

## Installation

```sh
yarn add podcastindexjs
```

## Usage

```ts
import { PodcastIndexClient } from "podcastindexjs";

// assumes you have your key and secret set as environment variables
const client = new PodcastIndexClient(process.env.API_KEY, process.env.API_SECRET);

client.search("javascript").then(console.log);

client.recentFeeds().then(console.log);
client.recentNewFeeds().then(console.log);
client.recentEpisodes().then(console.log);

client.podcastByUrl("https://feeds.theincomparable.com/batmanuniversity").then(console.log);
client.podcastById(75075).then(console.log);
client.podcastByItunesId(1441923632).then(console.log);

client.episodesByFeedUrl("https://feeds.theincomparable.com/batmanuniversity").then(console.log);
client.episodesByFeedId(75075).then(console.log);
client.episodesByItunesId(1441923632).then(console.log);
client.episodeById(16795106).then(console.log);
```

## Development

Before running any tests, you would need to add your `API KEY` and `API SECRET` to jestSetup.ts

## Community

Join on Discord at <https://discord.gg/d6apPvR3N6> or on <https://podcastindex.social/>
