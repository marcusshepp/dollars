function url_for_purchases(){
    return "/dollars/api/purchases/";
}

function init_purchases(){
    $.ajax({
        type: "GET",
        url: url_for_purchases(),
        success: function(data){
            if (data.cata_names_set){
              var purchased_items = build_table(  data.purchased_items_names,
                                                  data.purchased_date_created,
                                                  data.purchased_length,
                                                  data.amount_payed,
                                                  data.total,
                                                  data.cata_names_set,
                                                  data.cata_ids_set,
                                                  data.page_number,
                                                  data.total_pages,
                                                  data.per_page);
              $(".purchased_items_container").html(purchased_items);
              if (data.total == 0){
                  $("#total").html("<h3>$&emsp;" + data.total.toFixed(2) + "</h3>");
              } else {
                  $("#total").html("<h3>$&emsp;" + data.total + "</h3>");
              }
              $("#purchases_header").html("<h3>Purchases Made: All Time ("+data.purchased_length+")");
            }
        },
        failure: function(){
            console.log("fail @ init_purchases");
        },
    })
}
function build_table(purchased_items_names,purchased_date_created,purchased_length,amount_payed,total,cata_names_set,cata_ids_set,page_number,total_pages){
    var purchased_items = "";
    purchased_items += '<h4 id="purchases_header"><span>Purchases Made: All Time ('+purchased_length+')</span></h4>';
    for(var i = 0; i < cata_names_set.length; i++){
        purchased_items += '<input type="button" value="'+cata_names_set[i]+'" ';
        purchased_items += 'onclick="filter_purchase_tbl_by_catagory('+cata_ids_set[i]+')" class="purchase_filters">';
    }
    purchased_items += '<input type="button" class="see_more_catagories" ';
    purchased_items += 'onclick="see_more_catagories()" value="See More Catagories"/>';
    purchased_items += '<input type="search" class="search_purchases_field"/>';
    purchased_items += '<input type="button" class="search_purchases_btn" ';
    purchased_items += 'onclick="search_purchases()" value="Filter" />';
    purchased_items += '<div class="total">Total: '+ total +'</div>';
    purchased_items += '<table>';
    purchased_items += '<tr>';
    purchased_items += '<td>Item Purchased</td>';
    purchased_items += '<td>Date Purchased</td>';
    purchased_items += '<td>Amount Spent</td>';
    purchased_items += '</tr>';
    for(var i = 0; i < purchased_length; i++){
      purchased_items += '<tr>';
      purchased_items += "<td>" + purchased_items_names[i] + "</td>"
      purchased_items += "<td>" + purchased_date_created[i] + "</td>"
      purchased_items += "<td>" + amount_payed[i] + "</td>"
      purchased_items += '</tr>';
    }
    purchased_items += '</table>';
    purchased_items += '<span class="page_info">'+page_number+' of '+total_pages+' pages</span>';
    purchased_items += '<input type="button" value="prev" onclick="previous_purchase_page()" />';
    purchased_items += '<input type="button" value="next" onclick="next_purchase_page()" />';
    purchased_items += '<label for="purchase_per_page"> Number Per Page: </label>';
    purchased_items += '<select onchange="change_number_per_page()" ';
    purchased_items += 'class="purchase_per_page" name="purchase_per_page">';
    purchased_items += '<option name="purchases_per_page" value="5">default(5)</option>';
    for (var i = 6; i <= 10; i++){
        if (i == purchased_length){
            purchased_items += '<option selected="selected" name="purchases_per_page" value="'+i+'">'+i+'</option>';
        }
        purchased_items += '<option name="purchases_per_page" value="'+i+'">'+i+'</option>';
    }
    purchased_items += '</select>';
    return purchased_items;
}
function filter_purchase_tbl_by_catagory(catagory_id){
    $.ajax({
        type: "POST",
        url: url_for_purchases(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "catagory_id": catagory_id,
        },
        success: function(data){
            if (data.no_purchases_for_query){
              var problem = '<input type="button" name="name" value="Reload Purchase Table" onclick="init_purchases()" class="purchase_filters">';
              problem += '<p>No purchases match this query.</p>';
              $(".purchased_items_container").html(problem);
            } else {
              var purchased_items = build_table(  data.purchased_items_names,
                                                  data.purchased_date_created,
                                                  data.purchased_length,
                                                  data.amount_payed,
                                                  data.total,
                                                  data.cata_names_set,
                                                  data.cata_ids_set);
              $(".purchased_items_container").html(purchased_items);
              if (data.total == 0){
                  $("#total").html("<span>$&emsp;" + data.total.toFixed(2) + "</span>");
              } else {
                  $("#total").html("<span>$&emsp;" + data.total + "</span>");
              }
              var purchase_y_total = "";
              purchase_y_total += "<h3>Purchases Made: All Time ("+data.purchased_length+")";
              $("#purchases_header").html(purchase_y_total);
            }
        },
        failure: function(){
            console.log("failure @ filter_purchase_tbl_by_catagory");
        },
    })
}

function previous_purchase_page(){
    $.ajax({
        type: "POST",
        url: url_for_purchases(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "move": true,
            "prev": true
        },
        success: function(){
            console.log("success");
            init_purchases()
        },
        failure: function(){
            console.log("failure");
        },
    });
}

function next_purchase_page(){
    $.ajax({
        type: "POST",
        url: url_for_purchases(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "move": true,
            "next": true
        },
        success: function(){
            console.log("success");
            init_purchases();
        },
        failure: function(){
            console.log("failure");
        },
    });
}
function change_number_per_page(){
    console.log();
    $.ajax({
        type: "POST",
        url: url_for_purchases(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "number_per_page": $(".purchase_per_page").val(),
        },
        success: function(){
            console.log("success");
            init_purchases();
        },
        failure: function(){
            console.log("failure");
        },
    });
}
