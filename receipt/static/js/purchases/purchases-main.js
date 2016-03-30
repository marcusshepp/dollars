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
    purchased_items += '<div class="purchase_table_inner_container">';
    purchased_items += '<div class="purchase_table_column_header_container">';
    purchased_items += '<div class="purch purchase_table_column_header_container_inline">Item Purchased</div>';
    purchased_items += '<div class="purch purchase_table_column_header_container_inline">Date Purchased</div>';
    purchased_items += '<div class="purch purchase_table_column_header_container_inline">Amount Spent</div>';
    purchased_items += '</div>';
    for(var i = 0; i < purchased_items_names.length; i++){
      purchased_items += '<div class="purch purchase_table_individual_purchase_container">';
      purchased_items += '<div class="purch purchase_table_individual_purchase_data">' + purchased_items_names[i] + '</div>';
      purchased_items += '<div class="purch purchase_table_individual_purchase_data">' + purchased_date_created[i] + '</div>';
      purchased_items += '<div class="purch purchase_table_individual_purchase_data">' + amount_payed[i] + '</div>';
      purchased_items += '</div>';
    }
    purchased_items += '</div>';
    purchased_items += '<div class="pagination_container">';
    purchased_items += '<div class="pagination_firstblock_container">';
    purchased_items += '<div class="blank_of_blank">'+page_number+' of '+total_pages+' pages</div>';
    purchased_items += '<div class="prev_next_container">';
    purchased_items += '<input class="btn pagination_btn" type="button" value="prev" onclick="previous_purchase_page()" />';
    purchased_items += '<input class="btn pagination_btn" type="button" value="next" onclick="next_purchase_page()" />';
    purchased_items += '</div>';
    purchased_items += '</div>';
    purchased_items += '<div class="number_per_page_container">';
    purchased_items += '<label for="purchase_per_page"> Number Per Page: </label>';
    purchased_items += '<select onchange="change_number_per_page()" ';
    purchased_items += 'class="purchase_per_page" name="purchase_per_page">';
    purchased_items += '<option name="purchases_per_page" value="5">default(5)</option>';
    for (var i = 6; i <= 10; i++){
        if (i == purchased_length){
            purchased_items += '<option selected="selected" name="purchases_per_page" value="'+i+'">'+i+'</option>';
        } else {purchased_items += '<option name="purchases_per_page" value="'+i+'">'+i+'</option>';}
    }
    purchased_items += '</select>';
    purchased_items += '</div>'
    purchased_items += '</div>'
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
                                                  data.cata_ids_set,
                                                  data.page_number,
                                                  data.total_pages,
                                                  data.per_page);
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
            init_purchases();
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
function toggle_purchases(){
  $(".purchased_items_container").slideToggle();
  if ($(".purchases_hide_toggle_btn").val() == "Hide"){
    $(".purchases_hide_toggle_btn").val("Show");
  } else {
    $(".purchases_hide_toggle_btn").val("Hide");
  }
}
