var fs = require('fs');
var $ = require('jquery');
var path = require('path');

var fileType = 'json';
var domain = 'http://sofifa.com';
var pagesAmount = 333;
var dataDir = 'players1';

var mkdirs = function(dirpath, mode, callback) {
	mode = mode || 0755;
    callback = callback || function(){};
    fs.exists(dirpath, function(exists) {
        if(exists) {
            callback(dirpath);
        } else {
            mkdirs(path.dirname(dirpath), mode, function(){
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};

function playerParser(html) {
	var $article = $(html).find('article');
	
	var player = {};
	player['avatar'] = $article.find('h1 img').attr('data-frz-src');
	var names = $.trim($article.find('h1').text());
	player['sname'] = names.split('\n')[0].slice(0, -1);
	player['fname'] = names.split('\n')[1];

	var $lis = $article.find('ul').eq(0).find('li');
	player['nation'] = {
		id: $lis.find('.n-flag').attr('class').split(' ')[1].substr(2),
		name: $lis.eq(0).text().split('\n')[1]
	};
	player['birthday'] = $lis.eq(1).text().match(/\([^\)]+\)/)[0].slice(1, -1);
	player['height'] = $lis.eq(2).text().split('\n')[1].substr(0, 3) - 0;
	player['weight'] = $lis.eq(2).text().split(' ')[1].substr(0, 2) - 0;
	player['overall'] = $lis.eq(3).find('.prop').text() - 0;
	player['potential'] = $lis.eq(4).find('.prop').text() - 0;
	player['position'] = [];
	$lis.eq(5).find('.pos').each(function() {
		player['position'].push($(this).text());
	});
	player['foot'] = $lis.eq(6).text().split('\n')[2];

	$lis = $article.find('ul').eq(1).find('li');
	player['id'] = $lis.eq(0).text().split('\n')[2] - 0;
	player['reputation'] = $lis.eq(1).find('img').attr('title') - 0;
	player['weakfoot'] = $lis.eq(2).find('img').attr('title') - 0;
	player['skillmoves'] = $lis.eq(3).find('img').attr('title') - 0;
	player['awr'] = $lis.eq(4).find('span').text();
	player['dwr'] = $lis.eq(5).find('span').text();

	var $club = null;
	if ($article.find('.player-team').length === 2) {
		$club = $article.find('.player-team').eq(1);
	} else {
		$club = $article.find('.player-team').eq(0);
	}
	player['club'] = {
		name: $club.find('h6').text(),
		logo: $club.find('.logo').attr('src')
	};

	// var $attr = $article.find('.total_percent').next().next();
	var $attr = $article.find('h6').next('.prop-list');
	$lis = $attr.eq(0).find('li');
	player['attacking'] = {
		crossing: $lis.eq(0).find('.prop').text() - 0,
		finishing: $lis.eq(1).find('.prop').text() - 0,
		heading: $lis.eq(2).find('.prop').text() - 0,
		spassing: $lis.eq(3).find('.prop').text() - 0,
		volleys: $lis.eq(4).find('.prop').text() - 0
	};
	$lis = $attr.eq(1).find('li');
	player['skill'] = {
		dribbling: $lis.eq(0).find('.prop').text() - 0,
		curve: $lis.eq(1).find('.prop').text() - 0,
		freekick: $lis.eq(2).find('.prop').text() - 0,
		lpassing: $lis.eq(3).find('.prop').text() - 0,
		control: $lis.eq(4).find('.prop').text() - 0
	};
	$lis = $attr.eq(2).find('li');
	player['movement'] = {
		acceleration: $lis.eq(0).find('.prop').text() - 0,
		speed: $lis.eq(1).find('.prop').text() - 0,
		agility: $lis.eq(2).find('.prop').text() - 0,
		reactions: $lis.eq(3).find('.prop').text() - 0,
		balance: $lis.eq(4).find('.prop').text() - 0
	};
	$lis = $attr.eq(3).find('li');
	player['power'] = {
		shotpower: $lis.eq(0).find('.prop').text() - 0,
		jumping: $lis.eq(1).find('.prop').text() - 0,
		stamina: $lis.eq(2).find('.prop').text() - 0,
		strength: $lis.eq(3).find('.prop').text() - 0,
		longshots: $lis.eq(4).find('.prop').text() - 0
	};
	$lis = $attr.eq(4).find('li');
	player['mentality'] = {
		aggressing: $lis.eq(0).find('.prop').text() - 0,
		interceptions: $lis.eq(1).find('.prop').text() - 0,
		positioning: $lis.eq(2).find('.prop').text() - 0,
		vision: $lis.eq(3).find('.prop').text() - 0,
		penalties: $lis.eq(4).find('.prop').text() - 0
	};
	$lis = $attr.eq(5).find('li');
	player['defending'] = {
		marking: $lis.eq(0).find('.prop').text() - 0,
		standing: $lis.eq(1).find('.prop').text() - 0,
		sliding: $lis.eq(2).find('.prop').text() - 0
	};
	$lis = $attr.eq(6).find('li');
	player['gk'] = {
		diving: $lis.eq(0).find('.prop').text() - 0,
		handling: $lis.eq(1).find('.prop').text() - 0,
		kicking: $lis.eq(2).find('.prop').text() - 0,
		gkposition: $lis.eq(3).find('.prop').text() - 0,
		reflexes: $lis.eq(4).find('.prop').text() - 0
	};

	$lis = $attr.eq(7).find('li');
	player['traits'] = [];
	$lis.each(function() {
		player['traits'].push($(this).text());
	});

	$lis = $attr.eq(8).find('li');
	player['specialities'] = [];
	$lis.each(function() {
		player['specialities'].push($.trim($(this).text()));
	});

	return player;
}

function rankParser(html) {
	var rank = [];
	var $trs = $(html).find('tbody').find('tr');

	for (var i = 0, len = $trs.length; i < len; ++i) {
		(function() {
			var item = {};
			var $tds = $trs.eq(i).find('td');
			var urlComp = $tds.eq(2).find('img').attr('data-frz-src').split('/');
			var id = urlComp[urlComp.length - 1].split('.')[0];
			item.fileName = i + 1 + '-' + id;
			item.link = $tds.eq(5).find('a').attr('href');
			rank.push(item);
		})();
	}

	return rank;
}

function crawlAllPlayers() {
	for (var iPage = 1; iPage <= pagesAmount; ++iPage) {
		(function(indexP) {
			$.get(domain + '/cn/14w/p/a?col=oa&desc=true&page=' +　indexP, function(rankHTML) {
				var rank = rankParser(rankHTML);
				var dir = dataDir + '/' + indexP;

				mkdirs(dir, 0755, function() {
					console.log('Processing ' + dir + ' ...');				
					for (var i = 0, len = rank.length; i < len; ++i) {
						(function(index) {
							$.get(domain + rank[index].link, function(playerHTML) {
								var player = playerParser(playerHTML);
								var file = dir + '/' + rank[index].fileName + '.' + fileType;
								fs.writeFile(file, JSON.stringify(player), function(err) {
									if (err) throw err;
									console.log(file + ' Saved!');
								});
							});
						})(i);
					}
				});			
			});
		})(iPage);
	}
}

function crawlOnePlayer() {
	$.get('http://sofifa.com/cn/14w/p/149162-aleksandar-dragovic', function(html) {
		var player = playerParser(html);
		console.log(player);
	});
}

crawlAllPlayers();
