
// fourfactors boxscore
// version 0.9
// 2012-10-31
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script that adds team 4-factors stats
// to ESPN NBA boxscores
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "ESPN4Factors", and click Uninstall.
//
//
// ==UserScript==
// @name          fourfactors
// @description   Adds team 4-factors stats to ESPN NBA boxscores
// @include       http://*.espn.go.com/nba/boxscore?gameId=*
// @include       http://*.espn.go.com/nba/boxscore/_/id/*
// @include       http://espn.go.com/nba/boxscore/_/id/*
// @include       http://espn.go.com/nba/boxscore/_/id/*
// ==/UserScript==

/* BEGIN LICENSE BLOCK
Copyright (C) 2007 cherokee_acb
Copyright (C) 2012 @swang
This version maintained at http://github.com/swang

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You can download a copy of the GNU General Public License at
http://diveintomark.org/projects/greasemonkey/COPYING
or get a free printed copy by writing to the Free Software Foundation,
Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
END LICENSE BLOCK */

doc = window.document;

var live = 0;

// Read team names
var homeTeam = document.querySelector("div.team.home h3 a").textContent;
var awayTeam = document.querySelector("div.team.away h3 a").textContent;

// First, the away team
var fieldGoalsCellAway = document.querySelectorAll("table.mod-data tr td[colspan='2']")[0].nextSibling;
if (fieldGoalsCellAway.textContent.match(/FGM/)) {
  fieldGoalsCellAway = document.querySelectorAll("table.mod-data tr td[colspan='2']")[1].nextSibling;
  live = 1;
}
function grabMadeAttempts(ele) {
  var text, made, attempt;
  text = ele.textContent
  made = parseInt(text.substring(0, text.indexOf("-")))
  attempt = parseInt(text.substring(text.indexOf("-")+1))
  return [made, attempt]
}
var fieldGoalsResultsAway = grabMadeAttempts(fieldGoalsCellAway)
var fieldGoalsMadeAway, fieldGoalsAttemptsAway;
fieldGoalsMadeAway = fieldGoalsResultsAway[0]
fieldGoalsAttemptsAway = fieldGoalsResultsAway[1]


var threePointFGCellAway = fieldGoalsCellAway.nextSibling;
var threePointFGResultsAway = grabMadeAttempts(threePointFGCellAway)
var threePointFGMadeAway = threePointFGResultsAway[0]
var threePointFGAttemptsAway = threePointFGResultsAway[1]

var freeThrowCellAway = threePointFGCellAway.nextSibling;
var freeThrowResultsAway = grabMadeAttempts(freeThrowCellAway)
var freeThrowMadeAway = freeThrowResultsAway[0]
var freeThrowAttemptsAway = freeThrowResultsAway[1]

var offensiveReboundsCellAway = freeThrowCellAway.nextSibling;
var defensiveReboundsCellAway = offensiveReboundsCellAway.nextSibling;
var offensiveReboundsAway = parseInt(offensiveReboundsCellAway.textContent);
var defensiveReboundsAway = parseInt(defensiveReboundsCellAway.textContent);
if (live) {
  defensiveReboundsAway = defensiveReboundsAway-offensiveReboundsAway;
}

// Now the home team

var fieldGoalsCellHome = document.querySelectorAll("table.mod-data tr td[colspan='2']")[2].nextSibling;
if (live) {
  fieldGoalsCellHome = document.querySelectorAll("table.mod-data tr td[colspan='2']")[4].nextSibling;
}
var fieldGoalsResultsHome = grabMadeAttempts(fieldGoalsCellHome)
var fieldGoalsMadeHome = fieldGoalsResultsHome[0]
var fieldGoalsAttemptsHome = fieldGoalsResultsHome[1]

var p3cH = fieldGoalsCellHome.nextSibling;
var p3rH = grabMadeAttempts(p3cH)
var p3mH = p3rH[0]
var p3aH = p3rH[1]

var ftcH = p3cH.nextSibling;
var ftrH = grabMadeAttempts(ftcH)
var ftmH = ftrH[0]
var ftaH = ftrH[1]
console.log(ftmH,ftaH)
var orcH = ftcH.nextSibling;
var drcH = orcH.nextSibling;
var orH = parseInt(orcH.textContent);
var drH = parseInt(drcH.textContent);
if (live) {
  drH = drH-orH;
}

// We use total team turnovers, instead of the sum of player turnovers in the boxscore
var toCells = doc.evaluate("//td[@colspan='15']", doc.body, null,
                               XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
var toCells = 15;
if (live) {
  //var toCells = doc.evaluate("//td[@colspan=14]", doc.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  toCells = 14;
}
var gameDateCell = document.querySelector("div.game-time-location p:nth-of-type(1)").textContent
var gameDate = new Date( gameDateCell.substring( gameDateCell.indexOf(",") ) )

var toRegEx;

toRegEx = /Team TO \( points off \):\s+(\d+)/;

// 2012-2013 season changes text so we RegEx on something different
if (gameDate.getFullYear() >= 2012 && gameDate.getMonth() >= 9) {
  toRegEx = /Team Turnovers \(Points off turnovers\):\s+(\d+)/
}

var toHolderA = document.querySelectorAll("td[colspan='15'] div:nth-of-type(1)")[0].textContent.match(toRegEx);
var toHolderH = document.querySelectorAll("td[colspan='15'] div:nth-of-type(1)")[1].textContent.match(toRegEx);

var toA = parseInt(toHolderA[1]);
var toH = parseInt(toHolderH[1]);

// Get minutes played
var clock = document.querySelector('p.game-state').textContent;

//doc.evaluate("//p[@class='game-state']", doc.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
var min = 48;
if (clock.match(/Final/)) {
  if (clock.match(/OT/)) {
    if (clock.charAt(10) == 'O' ) {
      min = 53;
    }
    else {
      min = 48 + 5*clock.charAt(10);
    }
  }
}
else if (clock.match(/Halftime/)) {
  min = 24;
}
else if (clock.match(/End of 1st/)) {
  min = 12;
}
else if (clock.match(/End of 3rd/)) {
  min = 36;
}
else {
  delimIndex = clock.indexOf(":");
  min = 11-parseInt(clock.substr(delimIndex-2, 2));
  var secs = 60-parseInt(clock.substr(delimIndex+1, 2));
  var quarter = parseInt(clock.substr(delimIndex+6, 1));
  min += secs/60 + 12*(quarter-1);
}

// For possessions, we use the Hollinger formula with a 0.976 correction factor.
//  Then we average both team estimates, and round to the nearest integer
var possA = fieldGoalsAttemptsAway + 0.44*freeThrowAttemptsAway - offensiveReboundsAway + toA;
var possH = fieldGoalsAttemptsHome + 0.44*ftaH - orH + toH;
var poss = 0.976*(possH + possA)/2;
poss = poss.toFixed(0);
var pace = 48*poss/min;

// Now, we compute efficiency and the four factors
var effA = 100*(2*fieldGoalsMadeAway + threePointFGMadeAway + freeThrowMadeAway)/poss;
var efgA = 100*(fieldGoalsMadeAway + 0.5*threePointFGMadeAway)/fieldGoalsAttemptsAway;
var freeThrowResultsAway = 100*freeThrowMadeAway/fieldGoalsAttemptsAway;
var orpA = 100*offensiveReboundsAway/(offensiveReboundsAway+drH);
var toffensiveReboundsAway = 100*toA/poss;

var effH = 100*(2*fieldGoalsMadeHome + p3mH + ftmH)/poss;
var efgH = 100*(fieldGoalsMadeHome + 0.5*p3mH)/fieldGoalsAttemptsHome;
var ftrH = 100*ftmH/fieldGoalsAttemptsHome;
var orpH = 100*orH/(orH+defensiveReboundsAway);
var torH = 100*toH/poss;

// Finally, we create the table, rows and cells where data will be displayed.
// Particularly good and bad stats are highlighted in green or red
// I'm using percentiles P20 and P80 to set the thresholds
var paceHigh = 96;  var paceLow = 86;
var effHigh = 116;  var effLow = 96;
var efgHigh = 55;   var efgLow = 45;
var ftrHigh = 32;   var ftrLow = 18;
var orpHigh = 34;   var orpLow = 20;
var torHigh = 18;   var torLow = 12;
var colorGood = '#C3FFC3';
var colorBad = '#FFB6B6';

var tdAux;
var bold;
var cellWidth = '50px';

var factors = doc.createElement("table");
// factors.setAttribute('align','center');

var header = doc.createElement("tr");
header.setAttribute('align', 'center');
tdAux = doc.createElement("td");
header.appendChild(tdAux);
tdAux = doc.createElement("td");
under = doc.createElement("u");
if (min == 48) {
    under.textContent = "Pace";
    tdAux.setAttribute('width',cellWidth );
}
else {
    under.textContent = "Pace (Poss)";
    tdAux.setAttribute('width',2*cellWidth );
}
tdAux.appendChild(under);
header.appendChild(tdAux);
tdAux = doc.createElement("td");
under = doc.createElement("u");
under.textContent = "Eff";
tdAux.appendChild(under);
tdAux.setAttribute('width',cellWidth );
header.appendChild(tdAux);
tdAux = doc.createElement("td");
under = doc.createElement("u");
under.textContent = "eFG";
tdAux.appendChild(under);
tdAux.setAttribute('width',cellWidth );
header.appendChild(tdAux);
tdAux = doc.createElement("td");
under = doc.createElement("u");
under.textContent = "FT/FG";
tdAux.appendChild(under);
tdAux.setAttribute('width',cellWidth );
header.appendChild(tdAux);
tdAux = doc.createElement("td");
under = doc.createElement("u");
under.textContent = "OREB%";
tdAux.appendChild(under);
tdAux.setAttribute('width',cellWidth );
header.appendChild(tdAux);
tdAux = doc.createElement("td");
under = doc.createElement("u");
under.textContent = "TOr";
tdAux.appendChild(under);
tdAux.setAttribute('width',cellWidth );
header.appendChild(tdAux);


var aRow = doc.createElement("tr");
aRow.setAttribute('align', 'center');
tdAux = doc.createElement("td");
tdAux.setAttribute('align', 'left');
tdAux.setAttribute('class','team');
bold = doc.createElement("b");
bold.textContent = awayTeam;
tdAux.appendChild(bold);
aRow.appendChild(tdAux);
tdAux = doc.createElement("td");
if (min == 48) {
    tdAux.textContent = pace.toFixed(1);
}
else {
    tdAux.textContent = pace.toFixed(1) + " (" + poss + ")";
}
if (pace > paceHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (pace < paceLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
aRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = effA.toFixed(1);
if (effA > effHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (effA < effLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
aRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = efgA.toFixed(1) + "%";
if (efgA > efgHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (efgA < efgLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
aRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = freeThrowResultsAway.toFixed(1);
if (freeThrowResultsAway > ftrHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (freeThrowResultsAway < ftrLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
aRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = orpA.toFixed(1);
if (orpA > orpHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (orpA < orpLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
aRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = toffensiveReboundsAway.toFixed(1);
if (toffensiveReboundsAway > torHigh) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
} else if (toffensiveReboundsAway < torLow) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
}
aRow.appendChild(tdAux);

  // Home team
var hRow = doc.createElement("tr");
hRow.setAttribute('align', 'center');
tdAux = doc.createElement("td");
tdAux.setAttribute('align', 'left');
bold = doc.createElement("b");
bold.textContent = homeTeam;
tdAux.appendChild(bold);
hRow.appendChild(tdAux);
tdAux = doc.createElement("td");
// tdAux.textContent = pace.toFixed(1);
hRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = effH.toFixed(1);
if (effH > effHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (effH < effLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
hRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = efgH.toFixed(1) + "%";
if (efgH > efgHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (efgH < efgLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
hRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = ftrH.toFixed(1);
if (ftrH > ftrHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (ftrH < ftrLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
hRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = orpH.toFixed(1);
if (orpH > orpHigh) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
} else if (orpH < orpLow) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
}
hRow.appendChild(tdAux);

tdAux = doc.createElement("td");
tdAux.textContent = torH.toFixed(1);
if (torH > torHigh) {
    tdAux.setAttribute('style', "background: " + colorBad + ";");
} else if (torH < torLow) {
    tdAux.setAttribute('style', "background: " + colorGood + ";");
}
hRow.appendChild(tdAux);

factors.appendChild(header);
factors.appendChild(aRow);
factors.appendChild(hRow);

// We insert the 4 factors table into a <div> element, and this div just before the boxscore table
var factorsDiv = doc.createElement("div");
factorsDiv.setAttribute('align','center');
factorsDiv.appendChild(factors);
console.log(factorsDiv)

//var tabberNodes = document.querySelector('.gp-body')
var tabber = document.querySelector('.gp-body');
tabber.insertBefore(factorsDiv, tabber.firstChild);

//
// ChangeLog
// 2007-03-07 - 0.1 - First draft
// 2007-03-10 - 0.2 - Added support of live boxscores
// 2007-10-31 - 0.3 - Updated to 2007-08 format
// 2008-10-24 - 0.4 - Updated to 2008-09 preseason format & added good/bad stats highlighting
// 2008-11-01 - 0.5 - Fixed problem with live games in the new season
// 2009-01-10 - 0.6 - Updated to new ESPN format with a +/- column
// 2009-10-31 - 0.7 - Updated to 2009-10 format (fixes by philrl and Ben F. from the APBRmetrics board)
// 2010-02-07 - 0.8.2 - Updated to new 2010 format
// 2012-10-31 - 0.9 - New revised updates for new 2012 format.