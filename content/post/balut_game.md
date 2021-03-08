---
title: Balut web app
date: 2021-03-08
---

Last year when it became impossible to meet up and play games together, I wrote a web implementation of the game [Balut](https://en.wikipedia.org/wiki/Balut_(game)).
It is not the most known game in the world, but one that I have always enjoyed as a child.
The game can be found at [balut.app](https://balut.app).

## Rules of Balut

The goal of the game is similar to the game of Yahtzee.
The player starts each round with fives dices, and has up to three throws to collect a set of dices that they enter onto the board.
At each roll, the player can choose to save any number of dices and re-roll the remaining.

The final set of dices eyes must can be entered in one of the seven categories, with four fields for each category.
The first three categories are similar: collect the total number of eyes on either *fours*, *fives* or *sixes*.
*Straights* can only be entered if the player has rolled 1 through 5 or 2 through 6.
*Full house* can only by entered if the player has three of one kind and two of another kind.
In the *change* category, anything can be entered, but the total sum must equal to or above 100 points.
*Balut* can only be entered if all five dices show the same face, which is one of the more difficult rolls to get.
However, for each balut the player gets two points at the end.

At any point, if the player has no other options, they can always choose cross out any of the fields.

When all fields has been field out, the player checks if the different criterias for each category has been fulfilled.
For the first three categories, the sum of their four fields must be above a certain value.
For *straight* and *full house*, the player must get all of fields without any crosses.
*Chance* must sum to at least 100, while *balut* gives 2 points for each balut.

Lastly, the sum of all fields are summed to check for extra (positive or negative) points.

How many points each category gives are show in the rules section the [website](https://balut.app).

## Tech stack

The game is build in [ReactJS](https://reactjs.org) with [TypeScript](https://www.typescriptlang.org), using [tailwindcss](https://tailwindcss.com) for styling.
I enjoy using tailwindcss, as I find the system very light weight and intuitive, and always ran out of new names for components when using plain css or css modules.
Plus, it helps to easily add a light and a dark theme to the site.
It is build with a minimal design in mind, and with an attempt to serve as small file sizes as possible (although I always fell the files are getting too large as soon as any JS is introduced).

I plan to introduce a multiplayer feature into the game, where it would be possible to sync your game up with others.
This would allow you to see eachothers rolls and current state of the game.
But I have not found the time to finish this up yet, so lets see if it ever happens...
The code can be found on my [GitHub](https://github.com/OliverFlecke/balut-react/).
