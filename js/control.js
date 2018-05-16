function getValues(){
	var cells = document.getElementsByClassName('cell');
	var collect = [];
	var current = 0;
	for(var i = 0; i < 9; i++){
		var row = [];
		for(var j = 0; j < 9; j++){
			let x = current++;
			if (cells[x].value != '' && cells[x].value != NaN) {
				row.push(parseInt(cells[x].value));
			} else {
				row.push(UNASSIGNED);
			}
		}
		collect.push(row);
	}
	return collect;
}

var sleep;
var solving = 'on';
var fillCellClone = '';
function fillToInputs(array, inputs, time = 0){
	var string = JSON.stringify(array);
	var puzzle = JSON.parse(string);
	if (time == 0) {
		$('.cell').removeAttr('disabled');
		var cell = 0;
		for(var i = 0; i < puzzle.length; i++){
			for(var j = 0; j < puzzle[i].length; j++){
				inputs[cell++].value = puzzle[i][j];
			}
		}
	} else {
		$('.cell').attr('disabled', '');
		var merge = [];
		var count = 0;
		for(var i = 0; i < puzzle.length; i++){
			for(var j = 0; j < puzzle[i].length; j++){
				merge[count++] = puzzle[i][j];
			}
		}
		var cell = 0;
		if (fillCellClone == '') {
			fillCellClone = JSON.parse(JSON.stringify(fillCell));
		}
		sleep = setInterval(function(){
			fillCellClone.shift();
			solving = 'off';
			var number = cell++;
			inputs[fillCell[number]].style.background = '#f60';
			inputs[fillCell[number]].value = merge[fillCell[number]];
			if (number > 0) {
				var style = fillCell[number - 1];
				inputs[style].style.background = '#fff';
			}
			if (cell >= fillCell.length) {
				solving = 'on';
				clearInterval(sleep);
				$('.cell').removeAttr('disabled', '');
				$('.cell').css({'background' : '#FFF'});
				fillCellClone = '';
			}
		}, time * 1000);
	}
}

function stopFill(){
	clearInterval(sleep);
}
function continueFill(){
		$('.cell').css({'background' : '#FFF'});
		var puzzle = solveSudoku(valid, 0, 0);
		$('.cell').attr('disabled', '');
		var merge = [];
		var count = 0;
		for(var i = 0; i < puzzle.length; i++){
			for(var j = 0; j < puzzle[i].length; j++){
				merge[count++] = puzzle[i][j];
			}
		}
		var cell = 0;
		fillCellClone = fillCellClone.filter(key => key != 0);
		sleep = setInterval(function(){
			solving = 'off';
			var number = cell++;
			if (fillCellClone[number] != 0) {
				$('.cell').css({'background' : '#FFF'});
				inputs[fillCellClone[number]].style.background = '#f60';
				inputs[fillCellClone[number]].value = merge[fillCellClone[number]];
				fillCellClone[number] = 0;
			}

			if (cell >= fillCellClone.length) {
				solving = 'on';
				clearInterval(sleep);
				$('.cell').removeAttr('disabled', '');
				$('.cell').css({'background' : '#FFF'});
				fillCellClone = '';
			}
		}, $('#time').val() * 1000);
}
function setNewGame(level = 1) {
	solving = 'on';
	level = parseInt(level);
	if (level == 1)
		cellCount = 50;
	else if (level == 2)
		cellCount = 35;
	else if (level == 3)
		cellCount = 25;
	else 
		return false;
	while (true) {
		let random  = randomPuzzle();
		if (solveSudoku(random, 0, 0)) {
			valid = random;
			break;
		}
	}
	var newGame = generatePuzzle(cellCount);
	fillToInputs(newGame, inputs);
	oldgame = JSON.stringify(newGame);
}

function displaySolution(time){
	if (solving == 'off') {
		return false;
	}
	if (valid.length < 9) {
		$('.alert').each(function(){
			$(this).removeClass('alert-success');
			$(this).addClass('alert-danger');
			$(this).show();
			$(this).html('Bạn chưa tạo game mới!');
		});
		return false;
	}
	var solve = solveSudoku(valid, 0, 0);
	if (!solve) {
		$('.alert').each(function(){
			$(this).removeClass('alert-success');
			$(this).addClass('alert-danger');
			$(this).show();
			$(this).html('Game lỗi!');
		});
		return false;
	}
	fillToInputs(solve, inputs, time);
}


function reset() {
	solving = 'on';
	$('.cell').removeAttr('disabled');
	clearInterval(sleep);
	$('.alert').hide();
	$('.cell').css({'background': '#fff'});
	var array = generateEmptyPuzzle();
	if (oldgame != '') {
		array = JSON.parse(oldgame);
	}
	fillToInputs(array, inputs);
}

function clickNewGame() {
	let level = document.getElementById('level_number').value;
	reset();
	setNewGame(level);
	window.alert('Tạo thành công!!!');
}

function check(){
	$('.cell').each(function(){
		if ($(this).val() == "" || $(this).val() == 0) {
			$('.alert').each(function(){
				$(this).removeClass('alert-success');
				$(this).addClass('alert-danger');
				$(this).show();
				$(this).html('Bạn chưa hoàn thành!');

			});
			return false;
		}
	});
	var checkSolve = isSovled(getValues());
	console.log(checkSolve);
	if (checkSolve === true) {
		$('.alert').removeClass('alert-danger');
		$('.alert').addClass('alert-success');
		$('.alert').show();
		$('.alert').html('Bạn đã giải thành công!');
	} else{
		$('.alert').removeClass('alert-success');
		$('.alert').addClass('alert-danger');
		$('.alert').show();
		$('.alert').html('Bạn giải chưa đúng!');
	}
}

function shuffle(b) {
	let stringZeroToNine = JSON.stringify(b);
	let a = JSON.parse(stringZeroToNine);
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

$(document).ready(function(){
	$('input[type="number"]').keyup(function(){
		if ($(this).val() < 0 || $(this).val() > 9) {
			$(this).val(0);
		}
	});
	$('input[type="range"]').change(function(){
		var name = '';
		if ($(this).val() == 1) 
			name = 'Dễ';
		else if($(this).val() == 2)
			name = 'Trung bình';
		else
			name = 'Khó';
		$('span#level').html(name);
	});
	$(document).on('keypress', 'input', function(e){
		if (e.which == 69 || e.which == 101) {
			return false;
		}
		console.log(e.which);
	});
});
