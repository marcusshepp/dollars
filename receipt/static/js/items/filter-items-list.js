function filter_items_list_url(){
    return "/dollars/api/filter/items"
}

function get_filter_items(){
    $.ajax({
        type: "GET",
        url: filter_items_list_url(),
        success: function(data){
            console.log(data);
            build_filter_items( data.names,
                                data.where_from,
                                data.prices,
                                data.times_purchased,
                                data.ids,
                                data.page_number,
                                data.total_pages,
                                data.per_page,
                                data.catas,
                                data.total_number_of_items);
        },
        failure: function(){
            console.log("FAILURE @ get_filter_items");
        },
    });
}
function build_filter_items(names, where_froms  , prices, times_purchased, ids, page_number, total_pages, per_page, catas, total_number_of_items){
    item_markup = "";
    item_markup += '<span>';
    item_markup += '<h3>Items<span class="number_of_items"> ('+total_number_of_items+')</span></h3>';
    item_markup += '<input type="button" class="search_items_btn" ';
    item_markup += 'onclick="init_item_list()" value="Filter" />';
    item_markup += '<input type="search" class="search_items_field"/>';
    item_markup += '</span>';
    item_markup += '<br />';
    for (var i = 0; i < catas.length; i++){
      var cata_name = catas[0][i];
      var cata_id = catas[1][i];
      item_markup += '<input type="button" value="'+cata_name+'"';
      item_markup += ' onclick="filter_items_by_catagory('+cata_id+')"/>'
    }
    for (var i = 0; i < names.length; i++){
      var name = names[i];
      var where_from = where_froms[i];
      var price = prices[i];
      var times_purchase = times_purchased[i];
      var id = ids[i];
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
      item_markup += '<span class="page_info">'+page_number+' of '+total_pages+' pages</span>';
      item_markup += '<input type="button" value="prev" onclick="previous_item_page()" />';
      item_markup += '<input type="button" value="next" onclick="next_item_page()" />';
    item_markup += '<input type="button" class="see_more_catagories" ';
    item_markup += 'onclick="see_more_item_catagories()" value="More..."/>';
    $(".items_list_container").html(item_markup);
}
