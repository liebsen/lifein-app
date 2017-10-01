/* global jQuery */

(function($) {
	
	var options = {
		/* action='downoad' options */
		filename: 'table.csv',
		/* action='output' options */
		appendTo: 'body',
		/* general options */
		separator: ',',
		newline: '\n',
		quoteFields: true,
		excludeColumns: '',
		excludeRows: ''
	};
	
	function quote(text) {
		return '"' + text.replace('"', '""') + '"';
	}
	
	// taken from http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
	function download(filename, data) {
		var element = document.createElement('a');

		//element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		var BOM = "\uFEFF"; 
		element.setAttribute('href', 'data:application/csv;charset=utf-8,' + encodeURI(BOM + data));
		//$('a.download').attr('href', ;

		element.setAttribute('download', filename);
		
		element.style.display = 'none';
		document.body.appendChild(element);
		
		element.click();
		
		document.body.removeChild(element);
	}

	function titles(table) {
		var output = ""
		, rows = table.parent().find('.row.title').not(options.excludeRows)
		, numCols = rows.first().find("div > div").not(options.excludeColumns).length
		
		rows.each(function() {
			$(this).find("div").not(options.excludeColumns).find(" > div:first-child").not(options.excludeColumns).each(function(i, col) {
				col = $(col)
				, output += $.trim(col.text())

				if(i < numCols-1) {
					output += options.separator;
				} else {
					output += options.newline;
				}
			})
		})

		output += options.newline;
		return output
	}

	function convert(table) {
		var output = ""
		, rows = table.find('.row').not(options.excludeRows)
		, numCols = rows.first().find("div").not(options.excludeColumns).find(" > div").not(options.excludeColumns).length
		
		rows.each(function() {
			$(this).find("div > div:first-child").not(options.excludeColumns).each(function(i, col) {
				col = $(col)
				, str = options.quoteFields ? quote(col.text()) : col.text()
				, output += $.trim(str)

				if(i < numCols-1) {
					output += options.separator;
				} else {
					output += options.newline;
				}
			})
		})

		return output
	}
	
	$.fn.html2csv = function(action, opt) {
		if(typeof action === 'object') {
			opt = action;
			action = 'download';
		} else if(action === undefined) {
			action = 'download';
		}
		
		$.extend(options, opt);
		
		var table = this; // TODO use $.each
		
		switch(action) {
			case 'download':
				var csv = titles(table)
				//csv+= options.newline
				csv+= convert(table)
				download(options.filename, csv)
				break;
			case 'output':
				var csv = convert(table);
				$(options.appendTo).append($('<pre>').text(csv));
				break;
		}
		
		return this;
	}
	
}(jQuery));