function filter_items_list_url(){
    return "/dollars/api/filter/items"
}

function get_filter_items(){
    $.ajax({
        type: "GET",
        url: filter_items_list_url(),
        success: function(data){
            console.log(data);
            build_filter_items(data);
        },
        failure: function(){
            console.log("FAILURE @ get_filter_items");
        },
    });
}
function build_filter_items(data){
    item_markup = "";
    item_markup += '<span>';
    item_markup += '<h3>Items<span class="number_of_items"> ('+data.total_number_of_items+')</span></h3>';
    item_markup += '<input type="button" class="search_items_btn" ';
    item_markup += 'onclick="init_item_list()" value="Back" />';
    item_markup += '<input type="search" class="search_items_field"/>';
    item_markup += '<input type="button" onclick="search_item_list_by_chars()" class="search_items_btn" value="Search"/>';
    item_markup += '</span>';
    item_markup += '<br />';
    for (var i = 0; i < data.catas.length; i++){
      var cata_name = data.catas[0][i];
      var cata_id = data.catas[1][i];
      item_markup += '<input type="button" value="'+cata_name+'"';
      item_markup += ' onclick="filter_items_by_catagory('+cata_id+')"/>'
    }
    item_markup += '<div class="items_all_container">';
    for (var i = 0; i < data.names.length; i++){
      var name = data.names[i];
      var where_from = data.where_from[i];
      var price = data.prices[i];
      var times_purchase = data.times_purchased[i];
      var id = data.ids[i];
      item_markup += '<br />';
      item_markup += "<div id='item_container_" + id + "'>";
      item_markup += '<form id="item_' + id + '" class="item" action="api/items/" method="POST">';
      item_markup += '<div class="" onclick="show_item_info('+id+')">' + name + '</div>';
      item_markup += '<span class="purchase_btn" onclick="purchase_item('+id+')">Purchase</span>';
      item_markup += '<label class="purchase_number" name="purchase_number"> # </label>';
      item_markup += '<input type="number" step="1" name="item_per_page" value="1" /><br />';
      item_markup += '<span class="times_purchased">$ '+price+'</span>';
      item_markup += '<span class="times_purchased"> # of purchases: ' + times_purchase + '</span>';
      item_markup += '</form>';
      item_markup += '<div class="options" onclick="show_options(this, '+id+')">Options</div>';
      item_markup += "</div>";
      }
    item_markup += '</div>';
    if (data.total_pages){
      console.log("page");
      item_markup += '<span class="page_info">'+data.page_number+' of '+data.total_pages+' pages</span>';
      item_markup += '<input type="button" value="prev" onclick="previous_item_page()" />';
      item_markup += '<input type="button" value="next" onclick="next_item_page()" />';
      item_markup += '<input type="button" class="see_more_catagories" ';
      item_markup += 'onclick="see_more_item_catagories()" value="More..."/>';
    } else if(data.no_pagination){
      console.log("no page");
      item_markup += '<div>Showing Results For: ';
      item_markup += data.search_query
      item_markup += '</div>';
    }
    $(".items_list_container").html(item_markup);
}
function search_item_list_by_chars(){
  $.ajax({
    type: "POST",
    url: filter_items_list_url(),
    data: {
      "csrfmiddlewaretoken": csrf_func(),
      "query": $(".search_items_field").val(),
    },
    success: function(data){
      console.log("success");
    //   console.log(data);
      build_filter_items(data);
    },
    failure: function(){console.log("FAILURE @ search_item_list_by_char()");},
  });
}
