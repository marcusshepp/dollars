/* Items
 */
function init_item_list(){
    get_items();
}


 function get_items(){
   /*
   UPDATES DOM
   Ajax request to the items API.
   Populates the page with available items & purchases & total.
   */
   $.ajax({
       type: "GET",
       url: "/api/items/",
       data: {
         'FOO': 'BAR',
       },
       success: function(data){
         build_items(data.length,
                     data.names,
                     data.companies,
                     data.prices,
                     data.times_purchased,
                     data.ids);
       },
       failure: function(){
         console.log("fail");
       },
   });
 }
 function build_items(length, names, companies, prices, times_purchased, ids){
     if (length > 0){
         var item_markup = "";
         for (var i = 0; i < length; i++){
           var name = names[i];
           var company = companies[i];
           var price = prices[i];
           var times_purchase = times_purchased[i];
           var id = ids[i];
           item_markup += '<form id="' + id + '" class="item col-sm-12 col-lg-12" action="api/items/" method="POST">';
           item_markup += '<div class="pull-left" id="item_' + id + '">' + name;
           item_markup += '</div>';
           item_markup += '<div class="options pull-right" onclick="show_options(this, '+id+')">...</div>';
           item_markup += '<div class="purchase_btn pull-right" onclick="purchase_item('+id+')">Purchase</div>';
           item_markup += '<span class="times_purchased pull-right">$ '+price+'</span>'
           item_markup += '<span class="times_purchased pull-right"># of purchases: ' + times_purchase + '</span>';
           item_markup += '</div>';
           item_markup += '</form>';
         }
         $(".items").html(item_markup);
     } else {
         $(".items").html('<h4 class="no_items">You haven\'t created any Items yet.</h4>');
     }

 }

function show_options(th, id){
    var options = '<div class="options pull-right">'
    options += '<div onclick="hide_options(this, '+id+')" class="">...</div>';
    options += '<div onclick="edit('+id+')">Edit</div>&emsp;<div onclick="del('+id+')">Delete</div>&emsp;';
    options += '<div onclick="purchase_w_new_price(this, '+id+')">Purchase w New Price</div></div>';
    var options_div = $(th);
    options_div.replaceWith(options);
    $("#"+id).find("span").hide();
}
function hide_options(th, id){
    var a_options = "<span>&#8594;</span>";
    var options_div = $(th);
    var par = options_div.parent().filter(".options");
    par.replaceWith("<div class='options pull-right' onclick='show_options(this, "+id+")'><div class=''>...</div></div>")
}
function build_edit_form(catagory_names, catagory_ids, catagory_length, item_id, name, company, catagory, price){
    var form_str = "";
    form_str += '<h4 id="item_form_header">Editing Item: '+name+'</h4>';
    form_str += '<form class="formmy item_form" enctype="multipart/form-data">';
    form_str += '<p><label for="name">Name: </label><input type="text" name="name" placeholder="Name of Item" ';
    form_str += 'max_length="250" class="pull-right" value="'+name+'" /></p>';
    form_str += '<p><label for="company_came_from">Company: </label><input value="'+company+'" ';
    form_str += 'type="text" name="company_came_from" max_length="50" placeholder="Where does this come from?" class="pull-right"></p>';
    form_str += '<p><label for="catagory">Catagory: </label>';
    form_str += '<select name="catagory" class="pull-right catagory">';
    for (var i = 0; i < catagory_length; i++){
        form_str += '<option name="catagory" value="'+catagory_ids[i]+'">'+catagory_names[i]+'</option>';
    }
    form_str += '</select>';
    form_str += '</p>';
    form_str += '<p><label for="price">Price: </label><input ';
    form_str += 'type="number" value="'+price+'" placeholder="Price of Item" name="price" step="0.01" class="pull-right"></p>';
    form_str += '<input type="button" value="Save" class="edit_save_btn btn btn-default" onclick="edit_item(this.form, '+item_id+')">';
    form_str += '</form>';
    $(".item_form_container").html(form_str);
}
function edit(id){
    console.log(id);
    $.ajax({
        url: "/api/items_edit/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
        },
        success: function(data){
            if(data.no_id == true){
                console.log("no id :^(");
            } else {
                build_edit_form(
                    data.catagory_names,
                    data.catagory_ids,
                    data.catagory_length,
                    data.item_id,
                    data.item_name,
                    data.company_name,
                    data.item_catagory_id,
                    data.item_price);
            }
        },
    })
}
function edit_item(form, id){
    var form_data = $(form).serializeArray();
    // console.log(form_data);
    var name = form_data[0].value;
    var company_came_from = form_data[1].value;
    var catagory_id = form_data[2].value;
    var price = form_data[3].value;
    $.ajax({
        url: "/api/items_edit/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "edit": true,
            "name": name,
            "company_came_from": company_came_from,
            "price": price,
            "catagory_id": catagory_id,
        },
        success: function(data){
            // console.log("success");
            var name = $("#item_"+id).html();
            $("#header").html("<p style='color: green;'>Edit Item: " + name + "<span class='fa fa-check'></></p>");
            // create_action("Purchase", "Make purchase: "+name, "undo purchase");
            get_items();
            document.getElementsByClassName('item_form')[0].reset();
            build_edit_form(data.catagory_names, data.catagory_ids, data.catagory_length, "", "", "", "", "")
            var item_form_btns = "";
            item_form_btns += '<input type="button" value="Add" class="btn btn-default" onclick="send_new_item(this.form, false)">';
            item_form_btns += '<input type="button" name="name" value="Add & Purchase" class="btn btn-default" onclick="send_new_item(this.form, true)">';
            $(".edit_save_btn").replaceWith(item_form_btns);
            get_items();
        },
    });
}
function del(id){
    $.ajax({
        url: "/api/items_edit/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "delete_item": 1,
        },
        success: function(){
            // console.log("success");
            var name = $("#item_"+id).html();
            $("#header").html("<p style='color: green;'>Deleted Item: " + name + "<span class='fa fa-check'></></p>");
            // create_action("Purchase", "Make purchase: "+name, "undo purchase");
            get_items();
        },
    });
}
function purchase_w_new_price(th, id){
    var markup = "<input ";
    markup += "type='number' ";
    markup += "name='price' ";
    markup += "step='0.01' />";
    markup += "<input type='text' style='display: none;' />"
    markup += "<input type='button' ";
    markup += "onclick='post_purchase_w_new_price(this, "+id+")' "
    markup += "value='Submit' />"
    markup += "<div onclick='hide_options(this, "+id+")'>...</div>";
    $(th).parent().html(markup);
}
function post_purchase_w_new_price(th, id){
    var new_price = $("#"+id).find(":input")[1].value;
    // console.log($(th).find("input[type='number']")[0]);
    $.ajax({
        url: "/api/items/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "amount_payed": new_price,
        },
        success: function(){
            // console.log("success");
            var name = $("#item_"+id).html();
            $("#header").html("<p style='color: green;'>Purchase Made for: " + name + "&emsp; Amount Played: "+new_price+"<span class='fa fa-check'></></p>");
            create_action("Purchase", "Make purchase: "+name, "undo purchase");
        },
    });
}

function purchase_item(id){
  /*
  Creates a new purchase object by POST with Ajax.
  Also increases the int on the btn.
  */
  var form = $("#"+id)[0];
  var url = form.action;
  var form_data = $(form).serializeArray();
  $.ajax({
      type: 'POST',
      url: '/api/items/',
      data: {
          "csrfmiddlewaretoken": csrf_func(),
          "id": form.id,
      },
      success: function(){
          var name = $("#item_" + form.id).html()
          $("#header").html("<p style='color: green;'>Purchase Made:&emsp;" + name + "&emsp;<span class='fa fa-check'></></p>");
          create_action("Purchase", "Make purchase: "+name, "undo purchase");
          update_purchase_tbl();
      },
      error: function(){
          console.log("failure");
      },
  });
};
