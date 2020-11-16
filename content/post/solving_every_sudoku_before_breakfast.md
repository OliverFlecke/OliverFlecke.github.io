---
title: Solving every Sudoku before breakfast
date: 2020-10-31
---

## TL;DR

Just want to see the code? You can find it [here on GitHub](https://github.com/OliverFlecke/algorithms-prolog/blob/master/src/sudoku.pl).

## Primer

A few days ago, I was doing a [Sudoku](https://en.wikipedia.org/wiki/Sudoku), a puzzle game similar to cross word puzzles, but where the goal is to fill out every cell with a number.
Each number has to fulfill the following rules:

- Each *row* of numbers must be distinct
- Each *column* of numbers must be distinct
- Each *3x3 square* of numbers must be distinct

Quite simple, but it can still provide some interesting and challenging problems.

While I was completing a puzzle, I was wondering about the different techniques to solve them, and how these could be abstracted into a sudoku solving program.
I remember reading some articles on this problem back in university, when some of my class mates where trying to write a sudoku solver during a semester course.
They suggested [brute-force](https://en.wikipedia.org/wiki/Brute-force_search) algorithms to generate every possible solution until a valid one is found (e.g. using [backtracking](https://en.wikipedia.org/wiki/Backtracking)).
However, these solutions do not really scale well with the problem, and it is quite ease to create sudoku problems that they fail to solve (at least before I hit ctrl+c).

Another solution is to use [Knuth's Algorithm X](https://en.wikipedia.org/wiki/Knuth%27s_Algorithm_X) to model the problem as an *exact cover* problem.
This promise to be able to solve must sudokus rather quickly, and I thought, this must be the road to follow.
I went to bed, planning to give this a go in the morning.

## Enter Prolog

I woke up with another idea for a solution: [Prolog](https://en.wikipedia.org/wiki/Prolog).
Prolog is a programming language like no other, defined as a *logic programming* language, which is fantastic at solve some set of problems, like constraint problems (sudoku).
It had been a while since I had used this language, but I dusted off the old Prolog shelf, booted up my terminal, and did a quick `brew install swi-prolog` and was up and running.

## Implementation

First lets look at how we can model a sudoku problem in Prolog.
Here is a sample.

```prolog
[
	[_,2,_,6,_,8,_,_,_],
	[5,8,_,_,_,9,7,_,_],
	[_,_,_,_,4,_,_,_,_],
	[3,7,_,_,_,_,5,_,_],
	[6,_,_,_,_,_,_,_,4],
	[_,_,8,_,_,_,_,1,3],
	[_,_,_,_,2,_,_,_,_],
	[_,_,9,8,_,_,_,3,6],
	[_,_,_,3,_,6,_,9,_]
].
```

Notice that this is a valid Prolog term; it is a list of lists (rows).
All the given numbers are filled in, while the rest are given the `_`, indicating a value we do not care about.
Another benefit of this format, is that it can be stored in a file and read directly into a variable in Prolog.

So how do we solve a sudoku in Prolog?
Which algorithm are we using?
Instead of implementing any of the algorithms mentioned above, Prolog **is** the algorithm, we just have to list the rules.
So what are the rules?

First, lets make sure we are actually getting a valid sudoku board as an input.
We know that there should only be 9 rows and 9 columns.
This can be checked by:

```prolog
sudoku(Rows) :-
	length(Rows, 9),
	maplist(same_length(Rows), Rows).
```

This looks fairly simple, even if you are new to Prolog.
The first line, we define the name of our rule `sudoku`, which takes one argument, a list of rows.
The second line checks that there are exactly nine rows; the third that ever row has the same length as the number of rows (i.e. nine).
`maplist` will apply `same_length` for every element in the `Rows` list.
This means that

- `sudoku([])`
- `sudoku([[],[],[],[],[],[],[],[],[],[]])`

and all other invalid configurations will return false.

Next, lets make sure every number is in the valid range from 1 to 9, including.
This can be done with

```prolog
append(Rows, Ns), Ns ins 1..9
```

`append/2` takes a list of lists, and append all of the lists into one big list (a flatmap for all of you functional programmers).
The `ins` rule insures that every number is between 1 and 9, both including.

Now we need to check that the rows, columns and squares are all distinct.
Starting with the rows, we again apply `maplist` to map a rule over every row.
Prolog has a build in rule `all_distinct/1` that takes a list and validates that all elements are distinct.
So, to check the rows

```prolog
maplist(all_distinct, Rows)
```

For the columns, we want to do the exact same thing, only our input does not really match this.
Luckily, we can use another build in rule `transpose/2` which will convert our list of rows to a list of columns.

```prolog
transpose(Rows, Cols), maplist(all_distinct, Cols)
```

Now all numbers in the rows and all columns must be distinct.

The last part to tackle is the squares.
There are nine in total.
We could take every single number out of the rows list and write rules to match them manually.
For the first square, this could look like this:

```prolog
Rows = [R1, R2, R3 | _],
R1 = [N11, N12, N13 | _],
R2 = [N21, N22, N23 | _],
R3 = [N31, N32, N33 | _],
all_distinct([N11, N12, N13, N21, N22, N23, N31, N32, N33]).
```

We could continue this and extract all numbers from all rows, and create 9 lines of `all_distinct`.
However, it would be easy to messup which numbers goes where.

Instead, notice that we just remove the first three numbers from each row, creating three tails with six numbers left.
We can use recursion on these to solve the three squares spanning row one to three.
Lets make a new rule, `distinct_square`, which takes three list of numbers as input.

```prolog
distinct_square([], [], []).
distinct_square(
	[N11, N12, N13 | Tail1],
	[N21, N22, N23 | Tail2],
	[N31, N32, N33 | Tail3]) :-
	all_distinct([
		N11, N12, N13,
		N21, N22, N23,
		N31, N32, N33]),
	distinct_square(Tail1, Tail2, Tail3).
```

It is true if all lists are empty.
Otherwise, if the three first numbers of each list (each row) is all distinct, and all the tails also only contain distinct squares, it is also valid.

Lastly, we need to do this for all nine rows, not just the first three.

```prolog
distinct_squares([]).
distinct_squares([R1, R2, R3 | Rows]) :-
	distinct_square(R1, R2, R3),
	distinct_squares(Rows).
```

`distinct_squares` takes a list of rows.
It is valid for a empty list of rows, or if the first three rows are valid squares and the remain rows are valid.

## Solution

Here are the full solution.

```prolog
sudoku(Rows) :-
	length(Rows, 9),
	maplist(same_length(Rows), Rows),
	append(Rows, Ns), Ns ins 1..9,
	maplist(all_distinct, Rows),
	transpose(Rows, Cols),
	maplist(all_distinct, Cols),
	distinct_squares(Rows).

distinct_squares([]).
distinct_squares([R1, R2, R3 | Rows]) :-
	distinct_square(R1, R2, R3),
	distinct_squares(Rows).

distinct_square([], [], []).
distinct_square(
	[N11, N12, N13 | Tail1],
	[N21, N22, N23 | Tail2],
	[N31, N32, N33 | Tail3]) :-
	all_distinct([
		N11, N12, N13,
		N21, N22, N23,
		N31, N32, N33]),
	distinct_square(Tail1, Tail2, Tail3).
```

Even though the last part are a bit complex, it is still incredible how simple a program you can write in Prolog for solving such a complex problem.

Lets load the file into Prolog and try it out.

```sh
swipl sudoku.pl
```

In [my solution file](https://github.com/OliverFlecke/algorithms-prolog/blob/master/src/sudoku.pl) I have added a two helper methods, `read_problem` and `pretty`, which helps with reading a problem from a file and pretty print the solution to the terminal.
This can be used as

```prolog
read_problem('samples/sudoku/2.txt', P), sudoku(P), pretty(P).
```

Read the problem into `P`, solve `P`, and print `P`.
The output:

```prolog
[1, 5, 2, 4, 8, 9, 3, 7, 6].
[7, 3, 9, 2, 5, 6, 8, 4, 1].
[4, 6, 8, 3, 7, 1, 2, 9, 5].
[3, 8, 7, 1, 2, 4, 6, 5, 9].
[5, 9, 1, 7, 6, 3, 4, 2, 8].
[2, 4, 6, 8, 9, 5, 7, 1, 3].
[9, 1, 4, 6, 3, 7, 5, 8, 2].
[6, 2, 5, 9, 4, 8, 1, 3, 7].
[8, 7, 3, 5, 1, 2, 9, 6, 4].
```

I have tested this solution on sudoku problems with increasingly difficulty, and so far it has been spitting out a problem before I could blink.
Once again, I am quite amazed on what you can get out of Prolog.
