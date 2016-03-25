function filter_purchases_url(){
    return "/dollars/api/filter/purchases";
}

function get_filter_purchases(){
    $.ajax({
        type: "GET",
        url: filter_purchases_url(),
        success: function(data){
            console.log(data);
            build_filter_purchases(data, do_filter=false);
        },
        failure: function(){
            console.log('FAILURE @ get_filter_purchases()');
        },
    });
}

function build_filter_purchases(data, do_filter){
    var purchased_items = "";
    purchased_items += '<h4 id="purchases_header"><span>Purchases Made: All Time ('+data.purchased_length+')</span></h4>';
    purchased_items += '<input type="button" class="search_items_btn" ';
    purchased_items += 'onclick="init_purchases()" value="Back" />';
    purchased_items += '<input type="search" class="search_purchases_field"/>';
    purchased_items += '<input type="button" class="search_purchases_btn" ';
    purchased_items += 'onclick="post_by_char()" value="Filter" />';
    purchased_items += '<br />'
    for(var i = 0; i < data.catas.length; i++){
        var catagory_name = data.catas[i][0];
        var catagory_id = data.catas[i][1];
        purchased_items += '<input type="button" value="'+catagory_name+'" ';
        purchased_items += 'onclick="filter_purchase_tbl_by_catagory('+catagory_id+')" class="purchase_filters">';
    }
    purchased_items += '<input type="button" class="see_more_catagories" ';
    purchased_items += 'onclick="see_more_catagories()" value="More..."/>';
    purchased_items += '<div class="total">Total: '+ data.total +'</div>';
    purchased_items += '<table>';
    purchased_items += '<tr>';
    purchased_items += '<td>Item Purchased</td>';
    purchased_items += '<td>Date Purchased</td>';
    purchased_items += '<td>Amount Spent</td>';
    purchased_items += '</tr>';
    purchased_items += '<div class="filter_purchase_all_container">';
    for(var i = 0; i < data.purchased_items_names.length; i++){
      purchased_items += '<tr>';
      purchased_items += "<td>" + data.purchased_items_names[i].toUpperCase() + "</td>"
      purchased_items += "<td>" + data.purchased_date_created[i] + "</td>"
      purchased_items += "<td>" + data.amount_payed[i] + "</td>"
      purchased_items += '</tr>';
    }
    purchased_items += '</div>';
    purchased_items += '</table>';
    purchased_items += '<span class="page_info">'+data.page_number+' of '+data.total_pages+' pages</span>';
    purchased_items += '<input type="button" value="prev" onclick="previous_purchase_page()" />';
    purchased_items += '<input type="button" value="next" onclick="next_purchase_page()" />';
    purchased_items += '<label for="purchase_per_page"> Number Per Page: </label>';
    purchased_items += '<select onchange="change_number_per_page()" ';
    purchased_items += 'class="purchase_per_page" name="purchase_per_page">';
    purchased_items += '<option name="purchases_per_page" value="5">default(5)</option>';
    for (var i = 6; i <= 10; i++){
        if (i == data.purchased_length){
            purchased_items += '<option selected="selected" name="purchases_per_page" value="'+i+'">'+i+'</option>';
        } else {purchased_items += '<option name="purchases_per_page" value="'+i+'">'+i+'</option>';}
    }
    purchased_items += '</select>';
    $(".purchased_items_container").html(purchased_items);
}

function post_by_char(){
    $.ajax({
        type: "POST",
        url: filter_purchases_url(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "query": $(".search_purchases_field").val(),
        },
        success: function(data){
            console.log('success')
            build_filter_purchases(data, do_filter=true);
        },
        failure: function(){
            console.log("failure");
        },
    });
}
