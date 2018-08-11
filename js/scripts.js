/**
 * Created by yogev on 8/11/18.
 */

const host = 'http://localhost';
const port = ':8080';

$(document).ready(function () {
    $("#queryForm").submit(query);
    $('#printBtn').click(printDoc);
});

/**
 *
 * @param e
 */
function query(e) {
    showLoader();
    if (e) {
        e.preventDefault();
    }
    let query = $("input[name=query]").val();
    query = 'query=' + query;
    console.log(query);
    $.ajax({
        type: 'POST',
        url: host + port + '/search',
        data: query,
        cache: true,
        success: function (response) {
            response = JSON.parse(response);
            if (response.success) {
                for (let doc of response.data) {
                    if (doc.intro == '') {
                        doc.intro = createIntro(doc.content);
                    }
                }
                showResultTable(response.data);
            } else {
                toast('Error - Query', 'danger');
                console.log(response.data);
            }
        },
        error: () => {
            toast('Error - Query', 'danger');
        },
        complete: () => {
            hideLoader()
        }

    });
}

/**
 *
 * @param docname
 */
function getDoc(docname) {
    openDoc(docname);
    return;
    showLoader();
    $.ajax({
            url: host + port + '/getfile/' + docname,
            type: 'GET',
            data: {},
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            success: (response) => {
                response = JSON.parse(response)
                if (response.success) {
                    if (response.data.docname && response.data.content) {
                        showModal(response.data.docname, response.data.content)
                    }
                } else {
                    toast('Error openDoc', 'danger');
                    console.log(response.data);
                }
            },
            error: () => {
                toast('Error openDoc', 'danger')
            },
            complete: () => {
                hideLoader()
            }
        }
    )
}


/**
 *
 */
function showLoader() {
    $('#loader').show();
}

/**
 *
 */
function hideLoader() {
    $('#loader').hide();
}

/**
 *
 * @param msg
 * @param type warning, danger...
 */
function toast(msg, type) {
    let html = '<div class="alert alert-' + type + ' alert-dismissible" role="alert" style="display: none"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + msg + '</div>';
    let newToast = $.parseHTML(html);
    $('.alert-container').append(newToast);
    $(newToast).fadeIn(200);
    setTimeout(() => {
        $(newToast).fadeOut(500);
    }, 2000);
}

/**
 *
 * @param header
 * @param body
 */
function showModal(header, body) {
    //language=JQuery-CSS
    $('#docModal .modal-header h4').html(header);
    $('#docModal .modal-body p').html(body);
    $('#docModal').modal('show')

}

/**
 *
 */
function resetDocTable() {
    $('#pages').html("");
    $('#tbodyDocs').html('');
}

const docPerPage = 10;
var docMatrix;
var pageIndex;
var docList;


function showResultTable(docs) {
    pageIndex = 0;
    docMatrix = [];
    let reminingNumOfFiles = docs.length, offset = 0;
    while (reminingNumOfFiles > 0) {
        reminingNumOfFiles -= docPerPage;
        docMatrix.push(docs.slice(offset, offset + docPerPage));
        offset += docPerPage;
    }
    $('#pages').html("");
    for (let i = 0; i < docMatrix.length; i++) {
        $('#pages').append(`<a onclick="onResultPageClick(${i})">${i}</a>`);
    }
    if (docMatrix.length > 0) {
        updateResultTable(docMatrix[0], 0);
        $($('#pages a')[0]).addClass('active');
    } else {
        resetDocTable();
        toast('No results', 'warning');
    }

}

function onResultPageClick(index) {
    showLoader();
    setTimeout(() => {
        hideLoader();
        $('#pages a').removeClass('active');
        $($('#pages a')[index]).addClass('active');
        updateResultTable(docMatrix[index]);
    }, 500);
}

/**
 *
 * @param docs
 */
function updateResultTable(docs) {
    docList = docs;

    let keys = Object.keys(docList[0]);

    //tHead html
    let tHeadHtml = `<tr>
    <th>DocName</th>
    <th>Author</th>
    <th>year</th>
    <th>Intro</th>
</tr>`;

    //tBody Html
    let tBodyHtml = '';
    for (let doc of docList) {
        tBodyHtml += `<tr id="${doc.docname}">
    <td><a onclick="getDoc('${doc.docname}')">${doc.docname}</a></td>
    <td>${doc.auther }</td>
    <td>${doc.year}</td>
    <td>${doc.intro}</td>
</tr>`;
    }
    $('#theadDocs').html(tHeadHtml);
    $('#tbodyDocs').html(tBodyHtml);
}

function printDoc() {
    printElement($('.docContainer p'));
}

function printElement(e) {
    var ifr = document.createElement('iframe');
    ifr.style = 'height: 0px; width: 0px; position: absolute';
    document.body.appendChild(ifr);

    $(e).clone().appendTo(ifr.contentDocument.body);
    ifr.contentWindow.print();

    ifr.parentElement.removeChild(ifr);
}

function createIntro(content) {
    return content.split('\n', 3).join(' ');
}

function openDoc(docname) {
    if (docList.length < 1) {
        return false
    }
    for (let doc of docList) {
        if (doc.docname == docname) {
            showModal(docname, doc.content);
            return;
        }
    }
}
