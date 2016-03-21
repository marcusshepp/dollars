/* Items
 */
function item_list_url(){
  return "/dollars/api/items/";
}
function item_man_url(){
  return "/dollars/api/items_edit/";
}

function init_item_list(){
   /*
   UPDATES DOM
   Ajax request to the items API.
   Populates the page with available items & purchases & total.
   */
   $.ajax({
       type: "GET",
       url: item_list_url(),
       success: function(data){
        //  console.log(data);
         build_items(data.items,
                     data.names,
                     data.where_from,
                     data.prices,
                     data.times_purchased,
                     data.ids,
                     data.page_number,
                     data.total_pages,
                     data.per_page);
       },
       failure: function(){
         console.log("fail");
       },
   });
}
 function build_items(items, names, where_froms, prices, times_purchased, ids, page_number, total_pages, per_page){
     if (items){
         var item_markup = "";
         item_markup += '<h3>Items</h3>';
         for (var i = 0; i < names.length; i++){
           var name = names[i];
           var where_from = where_froms[i];
           var price = prices[i];
           var times_purchase = times_purchased[i];
           var id = ids[i];
           item_markup += "<p>";
           item_markup += '<form id="item_' + id + '" class="item" action="api/items/" method="POST">';
           item_markup += '<div class="" >' + name + ' from ' + where_from + '</div>';
           item_markup += '<div class="options" onclick="show_options(this, '+id+')">...</div>';
           item_markup += '<span class="purchase_btn" onclick="purchase_item('+id+')">Purchase</span>';
           item_markup += '<label class="purchase_number" name="purchase_number"> # </label>';
           item_markup += '<input type="number" step="1" name="item_per_page" value="1" /><br />';
           item_markup += '<span class="times_purchased">$ '+price+'</span>';
           item_markup += '<span class="times_purchased"> # of purchases: ' + times_purchase + '</span>';
           item_markup += '</form>';
           item_markup += "</p>";
           }
           item_markup += '<span class="page_info">'+page_number+' of '+total_pages+' pages</span>';
           item_markup += '<input type="button" value="prev" onclick="previous_item_page()" />';
           item_markup += '<input type="button" value="next" onclick="next_item_page()" />';
           item_markup += '<label for="item_per_page"> Number Per Page: </label>';
           item_markup += '<select onchange="change_item_number_per_page()" ';
           item_markup += 'class="item_per_page" name="item_per_page">';
           item_markup += '<option name="item_per_page" value="5">default(5)</option>';
           for (var i = 6; i <= 10; i++){
               if (i == per_page){
                   item_markup += '<option selected="selected" name="item_per_page" value="'+i+'">'+i+'</option>';
               } else {item_markup += '<option name="item_per_page" value="'+i+'">'+i+'</option>';}
           }
           item_markup += '</select>';
           console.log(item_markup);
         $(".items_list_container").html(item_markup);
     } else {
         $(".items_list_container").html('<h4 class="no_items">You haven\'t created any Items yet.</h4>');
     }

 }

function show_options(th, id){
    var options = '<div class="options">'
    options += '<div onclick="hide_options(this, '+id+')" class="">...</div>';
    options += '<div onclick="edit('+id+')">Edit</div>';
    options += '<div onclick="del('+id+')">Delete</div>';
    options += '<div onclick="purchase_w_new_price(this, '+id+')">Purchase w New Price</div>';
    options += '</div>';
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
    form_str += '<select name="catagory" class="catagory">';
    for (var i = 0; i < catagory_length; i++){
        form_str += '<option name="catagory" value="'+catagory_ids[i]+'">'+catagory_names[i]+'</option>';
    }
    form_str += '</select>';
    form_str += '</p>';
    form_str += '<p><label for="price">Price: </label><input ';
    form_str += 'type="number" value="'+price+'" placeholder="Price of Item" name="price" step="0.01" class=""></p>';
    form_str += '<input type="button" value="Save" class="edit_save_btn" onclick="edit_item(this.form, '+item_id+')">';
    form_str += '</form>';
    $(".item_form_container").html(form_str);
}
function edit(id){
    $.ajax({
        url: item_man_url(),
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
    var name = form_data[0].value;
    var company_came_from = form_data[1].value;
    var catagory_id = form_data[2].value;
    var price = form_data[3].value;
    $.ajax({
        url: item_man_url(),
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
            var name = $("#item_"+id+" div")[0].innerText;
            $("#header").html("<p style='color: green;'>Edit Item: " + name + "<span class='fa fa-check'></></p>");
            init_item_list();
            document.getElementsByClassName('item_form')[0].reset();
            build_edit_form(data.catagory_names, data.catagory_ids, data.catagory_length, "", "", "", "", "")
            var item_form_btns = "";
            item_form_btns += '<input type="button" value="Add" ';
            item_form_btns += 'class="" onclick="send_new_item(this.form, false)">';
            item_form_btns += '<input type="button" name="name" value="Add & Purchase" ';
            item_form_btns += 'class="" onclick="send_new_item(this.form, true)">';
            $(".edit_save_btn").replaceWith(item_form_btns);
            init_item_list();
        },
    });
}
function del(id){
    $.ajax({
        url: item_man_url(),
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "delete_item": 1,
        },
        success: function(){
            var name = $("#item_"+id).html();
            $("#header").html("<p>Deleted Item: " + name + "<span class=''></></p>");
            init_item_list();
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
    var new_price = $("#item_"+id).find(":input")[0].value;
    $.ajax({
        url: "/dollars/api/items/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "amount_payed": new_price,
        },
        success: function(){
            var name = $("#item_"+id).find("div")[0].innerText;
            $("#header").html("<p>Purchase Made for: " + name + " Amount Played: "+new_price+"<span class=''></></p>");
            create_action("Purchase", "Make purchase: "+name, "undo purchase");
        },
    });
}

function purchase_item(id){
  /*
  Creates a new purchase object by POST with Ajax.
  Also increases the int on the btn.
  */
  var form = $("#item_"+id)[0];
  var item_id = form.id.substr(5);
  $.ajax({
      type: 'POST',
      url: item_list_url(),
      data: {
          "csrfmiddlewaretoken": csrf_func(),
          "id": item_id,
      },
      success: function(data){
          var name = data.item_name;
          $("#header").html("<p>Purchase Made: " + name + " <span class=''></></p>");
          create_action("Purchase", "Make purchase: "+name, "undo purchase");
          init_purchases();
      },
      error: function(){
          console.log("failure");
      },
  });
};
function previous_item_page(){
    $.ajax({
        type: "POST",
        url: item_list_url(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "move": true,
            "prev": true
        },
        success: function(){
            console.log("success");
            init_item_list();
        },
        failure: function(){
            console.log("failure");
        },
    });
}

function next_item_page(){
    $.ajax({
        type: "POST",
        url: item_list_url(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "move": true,
            "next": true
        },
        success: function(){
            console.log("success");
            init_item_list()
        },
        failure: function(){
            console.log("failure");
        },
    });
}
function change_item_number_per_page(){
  console.log("change_number_per_page()");
  console.log( $(".item_per_page").val());
    $.ajax({
        type: "POST",
        url: item_list_url(),
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "number_per_page": $(".item_per_page").val(),
        },
        success: function(){
            console.log("success");
            init_item_list();
        },
        failure: function(){
            console.log("failure");
        },
    });
}
