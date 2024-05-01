let menu_data = [
	{id: "dashboard", icon: "mdi mdi-cart-outline", width: 20, value: "Dashboards", link: "/"},
	{id: "riwayat", icon: "mdi mdi-history", value: "Riwayat", link: "/riwayat"},
	{id: "barang", icon: "mdi mdi-semantic-web", value: "Data Barang", link: "/barang"}
];

let tglTrx = [
    {"trx": "12132314", "tanggal": "21", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "20", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "22", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "23", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "24", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "25", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "26", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "27", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "28", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
    {"trx": "12132314", "tanggal": "29", "bulan": "Mei, 2024", "waktu": "10:08:12", "pendapatan": "100.000", "laba": "30.000"},
]


let format = webix.Date.dateToStr("%d/%M/%Y");
let strDate = format(new Date());

function formatCurrency(value) {
    return webix.Number.format(value, {
        groupSize: 3,
        groupDelimiter: ".",
        decimalSize: 0,
        decimalDelimiter: ","
    });
}

webix.ready(function(){   
    webix.ui.fullScreen();
    webix.ui({
        rows: [
            // ==============> Header <==============
            {view: "toolbar", padding: 10, paddingX: 10, elements: [
                {view: "icon", icon: "mdi mdi-menu", width: 40, css: "icon_hamburger", click: function(){
                    $$("$sidebar1").toggle();
                 }
                },
                {view: "label", label: "KasirKu", css: "header_title"}
            ]},
            // =============> Main <===============
            {cols: [
                {
                    view:"sidebar",
                    collapsedWidth: 62,
                    border: true,
                    width: 200,
                    css: "sidebar_custom",
                    data: menu_data, 
                    on:{
                        onAfterSelect: function(id){
                            webix.message("Selected: "+this.getItem(id).value);

                            let selectedMenu = this.getItem(id);

                            if(selectedMenu.link){
                                window.location.href = selectedMenu.link
                            }
                        }
                    }
                },
                // ==========> Main Menu Content <==========
               {type: "line", rows: [ 
                    {minHeight: 60, cols: [
                        {view: "label", label: "MENU RIWAYAT TRANSAKSI", css: "custom_header_menu"},
                        {
                            id:"currentTime",
                            template: function(){     
                                webix.i18n.parseTimeFormat = "%H:%i";
                                webix.i18n.setLocale();
                                return strDate + "<span>&emsp;</span>" + webix.i18n.parseTimeFormatStr(new Date());
                            }, 
                            type: "clean", 
                            css: "text_right custom_header_time"
                        }
                    ]},
                    {cols: [
                        {rows: [
                            {
                                view: "toolbar",
                                id: "myToolbar",
                                maxHeight: 50,
                                paddingX: 10,
                                paddingY: 15,
                                margin: 15,
                                cols:[
                                    {view:"datepicker",align:"right",type:"month", label: "Filter Bulan", labelPosition: "top", gravity: 2},	
                                    {view:"text", label:"Cari No.Struk", name:"label", labelPosition: "top", gravity: 3},
                                    {gravity: 1}
                                ]
                            },
                            {
                                view: "list",
                                id: "list1",
                                dynamic: true,
                                type:{
                                    height: 68
                                },
                                template: "<table style='border-collapse: collapse'><tr><td rowspan='2' class='text_tgl_trx'>#tanggal#</td><td>#bulan# | #waktu#</td><td>Pendapatan</td><td>Laba</td><td rowspan='2'><span class='mdi mdi-arrow-right'></span></td></tr><tr class='text_bold'><td>No : #trx#</td><td>#pendapatan#</td><td>#laba#</td></tr></table>",
                                select: "multiselect",
                                data:tglTrx,
                                select: true,
                                on:{
                                    onItemClick:open_new_tab
                                }
                            },
                            {height: 68, cols: [
                                {template:"<div class='footer_total_label'>Pendapatan Total Bulanan</div><div class='footer_total_value'>90.000</div>"},
                                {template:"<div class='footer_total_label'>Laba Total Bulanan</div><div class='footer_total_value'>20.000</div>"},
                            ]}
                        ]},
                        {
                            view: "layout",
                            id: "layout",
                            rows: [
                                { template: "Detail Transaksi", height: 90 },
                                { id:"k", template: "Tidak ada Data"}
                            ]
                        }
                    ]}
               ]}
            ]}
        ]
    });   


    // // filter nama barang, id, jenis
    // $$("filter-table").attachEvent("onTimedKeypress", function(){
    //     var text = this.getValue().toString().toLowerCase();
    //     $$("table-barang").filter(function(obj){
    //         var filter = [obj.nama, obj.kode_barang].join("|");
    //         filter = filter.toString().toLowerCase();
    //         return (filter.indexOf(text) != -1);
    //     });
    // });

    // // // filter stok
    // $$("filter-number").attachEvent("onTimedKeypress", function(){
    //     var inputStok = this.getValue();
    //     $$("table-barang").filter(function(obj){
    //         if(inputStok === "" || inputStok === null){
    //             return obj;
    //         }
    //         return obj.stok < inputStok;
    //     });
    // });            

    function formatCurrency(value) {
        return webix.Number.format(value, {
            groupSize: 3,
            groupDelimiter: ".",
            decimalSize: 0,
            decimalDelimiter: ","
        });
    }

    function responsiveSidebar() {
        var width = document.body.offsetWidth;
        if (width <= 1000) {
            $$("$sidebar1").collapse();
        } else {
            $$("$sidebar1").expand();
        }
    }

    webix.event(window, "resize", function () {
        responsiveSidebar();
    });

    responsiveSidebar();


    
    function open_new_tab(){
        // var item = $$('list1').getItem(id);
        // console.log(item.trx)

        $$('k').hide()
        console.log($$('a') == false)
        if(!$$("a")){
            let a = {
                id: "a",
                view: "datatable",
                autoWidth: true,
                css: "webix_header_border webix_data_border",
                columns: [
                    {id: "no",             header: "No",          sort:"int", autoIncrement: true, width: 40 },
                    {id: "kode_barang",    header: "Kode Barang", fillspace: 1},
                    {id: "nama",           header: "Nama Barang", fillspace: 4},
                    {
                        id: "harga_jual", 
                        header: "Harga",
                        fillspace: 2, 
                        css: "text_right",
                        template: function(obj){
                            return formatCurrency(obj.harga_jual)
                        }
                    },
                    {id: "jumlah_barang",  header: "Jumlah",      fillspace: 2, css: "text_right"},
                    {
                        id: "total",
                        header: "Total",
                        fillspace: 2,
                        math:"[$r, harga_jual] * [$r, jumlah_barang]",
                        css: "text_right",
                        template: function(obj){
                            return formatCurrency(obj.total)
                        }
                    },
                ],
                data: [
                    { kode_barang: "A1", nama: "item1", harga_jual: 2000, jumlah_barang: 2},
                    { kode_barang: "B1", nama: "item1", harga_jual: 5000, jumlah_barang: 2},
                    { kode_barang: "C1", nama: "item1", harga_jual: 8000, jumlah_barang: 2},
                    { kode_barang: "D1", nama: "item1", harga_jual: 9000, jumlah_barang: 2},
                ],
                math: true,
                scroll: "y",
            };
            let total = {template: "halo"}
            $$("layout").addView(a)
            $$("layout").addView(total)
        }
    };
});