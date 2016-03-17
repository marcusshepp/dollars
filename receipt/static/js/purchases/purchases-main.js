function url_for_purchases(){
    return "/dollars/api/purchases/";
}

function init_purchases(){
    update_purchase_tbl();
}


function build_table(purchased_items_names, purchased_date_created, purchased_length, amount_payed, total, cata_names_set, cata_ids_set){
    console.log(cata_names_set);
    var purchased_items = "";
    purchased_items += '<h4 id="purchases_header"><span>Purchases Made: All Time ('+purchased_length+')</span></h4>';
    purchased_items += '<input type="button" name="name" value="Refresh" onclick="update_purchase_tbl()" class="purchase_filters">';
    purchased_items += '<span>Filters:</span>';
    for(var i = 0; i < cata_names_set.length; i++){
        purchased_items += '<input type="button" value="'+cata_names_set[i]+'" ';
        purchased_items += 'onclick="filter_purchase_tbl_by_catagory('+cata_ids_set[i]+')" class="purchase_filters">';
    }
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
    return purchased_items;
}
function update_purchase_tbl(){
    $.ajax({
        type: "GET",
        url: url_for_purchases(),
        success: function(data){
            console.log(data);
            var purchased_items = build_table(  data.purchased_items_names,
                                                data.purchased_date_created,
                                                data.purchased_length,
                                                data.amount_payed,
                                                data.total,
                                                data.cata_names_set,
                                                data.cata_ids_set);
            $(".purchased_items_container").html(purchased_items);
            if (data.total == 0){
                $("#total").html("<h3>$&emsp;" + data.total.toFixed(2) + "</h3>");
            } else {
                $("#total").html("<h3>$&emsp;" + data.total + "</h3>");
            }
            $("#purchases_header").html("<h3>Purchases Made: All Time ("+data.purchased_length+")");
        },
        failure: function(){
            console.log("fail @ update_purchase_tbl");
        },
    })
}
function filter_purchase_tbl_by_catagory(catagory_id){
    $.ajax({
        type: "POST",
        url: "/dollars/api/purchases/",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "catagory_id": catagory_id,
        },
        success: function(data){
            var purchased_items = build_table(  data.purchased_items_names,
                                                data.purchased_date_created,
                                                data.purchased_length,
                                                data.amount_payed,
                                                data.total);
            $("#purchased_items").html(purchased_items);
            if (data.total == 0){
                $("#total").html("<span>$&emsp;" + data.total.toFixed(2) + "</span>");
            } else {
                $("#total").html("<span>$&emsp;" + data.total + "</span>");
            }
            var purchase_y_total = "";
            purchase_y_total += "<h3>Purchases Made: All Time ("+data.purchased_length+")";
            $("#purchases_header").html([purchase_y_total]);
        },
        failure: function(){
            console.log("failure @ filter_purchase_tbl_by_catagory");
        },
    })
}
