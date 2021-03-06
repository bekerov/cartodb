describe("cdb.admin.dashboard.UserStats", function() {

  var user_stats;

  function generateUserStats(user_data) {

    return new cdb.admin.dashboard.UserStats({
      el:    $(".subheader"),
      model: new cdb.admin.User(user_data),
      tables : new cdb.admin.Tables(),
      localStorageKey: "test_user_storage"
    });

  }

  afterEach(function() {
    delete localStorage['test_user_storage'];
    $(".subheader").remove();
  });

  beforeEach(function() {

    $("body").append("<div class='subheader'></div>");

    config      = { custom_com_hosted: false };
    upgrade_url = "";

    var user_data = {
      id: 2,
      actions: {
        remove_logo: false,
        private_tables:true},
        username:"staging20",
        account_type:"FREE",

        // Table quota
        table_quota:100,
        table_count:2,

        // Space quota
        byte_quota:314572800,
        remaining_byte_quota:313876480,

        remaining_table_quota:98,

        api_calls:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,7074,0,2284,211,384,0,1201,0,93,0,510,293,709],
        api_key:"3ee8446970753b2fbdb1df345a2da8a48879ad00",
        layers:[],
        get_layers:true
    };

    user_stats = generateUserStats(user_data);

  });

  describe("UserStats", function() {

    it("should trigger an event when clicking in mapviews progress bar", function() {

      config = { custom_com_hosted: false };
      var user_stats = generateUserStats({ account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 0, table_quota: 10, byte_quota: 10, username: "development" });

      var called = false;

      user_stats.bind("gotoVisualizations", function() {
        called = true;
      });

      user_stats.render();
      $(".mapviews .progress").click();
      expect(called).toBeTruthy();

    });

    it("should trigger an event when clicking in tables progress bar", function() {

      config = { custom_com_hosted: false };
      var user_stats = generateUserStats({ account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 0, table_quota: 10, byte_quota: 10, username: "development" });

      var called = false;

      user_stats.bind("gotoTables", function() {
        called = true;
      });

      user_stats.render();
      $(".tables .progress").click();
      expect(called).toBeTruthy();

    });

    it("should hide itself if the user doesn't have tables", function() {

      config = { custom_com_hosted: false };
      var user_stats = generateUserStats({ account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 0, table_quota: 10, byte_quota: 10, username: "development" });
      var spy = spyOn(user_stats, "_deactivate");

      user_stats.render();
      expect(user_stats._deactivate).toHaveBeenCalled();

    });

  });

  describe("Dedicated support", function() {

    it("should show the dedicated support", function() {

      config = { custom_com_hosted: true };
      var user_stats = generateUserStats({ dedicated_support: true, account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 10, table_quota: 10, byte_quota: 10, username: "development" });
      var spy = spyOn(user_stats, "_showDedicatedSupport");

      user_stats.render();
      expect(user_stats._showDedicatedSupport).toHaveBeenCalled();

    });
  });

  describe("Warnings", function() {

    it("should show the migration warning by default", function() {

      var user_stats = generateUserStats({ account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 10, table_quota: 100, byte_quota: 10, username: "development" });

      user_stats.render();
      user_stats._toggleWarnings();

      expect($(".warning").hasClass("migrated") && $(".warning").hasClass("visible")).toBeTruthy();
      expect($(".warning.migrated.visible p.migrated").text()).toEqual("Welcome to the CartoDB 2.1 Version. Let us know if you find something weird or unexpected. We hope you like it!");

    });

    it("shouldn't show the warning message if the user is hosting the app", function() {

      config      = { custom_com_hosted: true };
      var user_stats = generateUserStats({ account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 10, table_quota: 10, byte_quota: 10, username: "development" });
      var spy = spyOn(user_stats, "_showWarning");

      user_stats.render();
      user_stats._toggleWarnings();

      expect(user_stats._showWarning).not.toHaveBeenCalled();

    });

    it("should show the warning message when the user is close to the limits", function() {

      var user_stats = generateUserStats({ migrated: true, account_type: "JOHN SNOW", remaining_byte_quota: 0, table_count: 10, table_quota: 10, byte_quota: 10, username: "development" });
      var spy = spyOn(user_stats, "_showWarning");

      user_stats.render();
      user_stats._toggleWarnings();

      expect(user_stats._showWarning).toHaveBeenCalledWith("limit");

    });

  });

  describe("Badge", function() {

    it("should set the right badge", function() {
      var user_stats = generateUserStats({ account_type: "JOHN SNOW", remaining_byte_quota: 100, username: "development" });
      user_stats.render();

      expect(user_stats.$el.find(".badge i").hasClass("john_snow")).toEqual(true);

      var user_stats = generateUserStats({ account_type: "MAGELLAN", remaining_byte_quota: 100, username: "development" });
      user_stats.render();
      expect(user_stats.$el.find(".badge i").hasClass("magellan")).toEqual(true);

    });

  });

  describe("Graphs", function() {

    it("should generate the mapviews graphs", function() {
      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, api_calls_quota: 1000, api_calls: [0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], remaining_byte_quota: 100, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();

      expect(user_stats.$el.find("section.stats .mapviews p").text()).toEqual('13 of 1000 map views ?');
    });

    it("should generate the mapviews graphs", function() {
      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, api_calls_quota: 50000, api_calls: [10000,500], remaining_byte_quota: 100, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();
      expect(user_stats.$el.find("section.stats .mapviews p").text()).toEqual('10.5K of 50K map views ?');

      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, api_calls_quota: 500000, api_calls: [50], remaining_byte_quota: 100, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();
      expect(user_stats.$el.find("section.stats .mapviews p").text()).toEqual('50 of 500K map views ?');

      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, remaining_byte_quota: 100, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();
      expect(user_stats.$el.find("section.stats .tables p").text()).toEqual('91 of 100 tables created');
    });

    it("should generate the table graphs (for infinite)", function() {
      var user_stats = generateUserStats({ table_quota: null, table_count: 91, remaining_byte_quota: 100, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();

      expect(user_stats.$el.find("section.stats .tables p").text()).toEqual('91 of ∞ tables created');
    });

    it("should generate the space graphs", function() {
      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, byte_quota: 100, remaining_byte_quota: 5, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();

      expect(user_stats.$el.find("section.stats .size p").text()).toEqual('95.0 of 100.0 used bytes');
    });

    it("should generate the space graphs (for unlimited)", function() {
      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, byte_quota: null, remaining_byte_quota: 5, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();

      expect(user_stats.$el.find("section.stats .size p").text()).toEqual('You have ∞ space');
    });

    it("should generate the size graphs (in megabytes)", function() {
      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, byte_quota: 524288000*2, remaining_byte_quota: 524288000, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();

      expect(user_stats.$el.find("section.stats .size p").text()).toEqual('500.0 of 1000.0 used megabytes');
    });

    it("should generate the size graphs (in gigabytes)", function() {
      var GB = 1073741824;
      var user_stats = generateUserStats({ table_quota: 100, table_count: 91, byte_quota: 5*GB, remaining_byte_quota: 2*GB, account_type: "JOHN SNOW", username: "development" });
      user_stats.render();

      expect(user_stats.$el.find("section.stats .size p").text()).toEqual('3.0 of 5.0 used gigabytes');
    });

  });

  describe("table quota", function() {

    it("should generate the table quota status message", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 0, account_type: "FREE", username: "dev", table_quota: 100, table_count: 2 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("table_quota_status")).toEqual('');
    });

    it("should generate the table quota status message for users withouth quota", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 0, account_type: "FREE", username: "dev",table_quota: 0, table_count: 2 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("table_quota_status")).toEqual('green');
    });

    it("should generate the table quota status message when the user is about to reach the limit", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 0, account_type: "FREE", username: "dev",table_quota: 100, table_count: 80 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("table_quota_status")).toEqual("danger");
      expect(user_stats.model.get("limits_tables_exceeded")).toEqual("tables");
    });

    it("should generate the table quota status message when the user reached the limit", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 0, account_type: "FREE", username: "dev",table_quota: 100, table_count: 100 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("table_quota_status")).toEqual("boom");
      expect(user_stats.model.get("limits_tables_exceeded")).toEqual("tables");
    });

  });

  describe("space quota", function() {

    it("should generate the space quota status message", function() {
      var user_stats = generateUserStats({ account_type: "FREE", username: "dev", byte_quota: 100, remaining_byte_quota: 2000 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("byte_quota_status")).toEqual('');
    });

    it("should generate the space quota status message for users withouth quota", function() {
      var user_stats = generateUserStats({ account_type: "FREE", username: "dev", byte_quota: 0, remaining_byte_quota: 23432322 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("byte_quota_status")).toEqual('green');
    });

    it("should generate the space quota status message when the user is about to reach the limit", function() {
      var user_stats = generateUserStats({ account_type: "FREE", username: "dev", byte_quota: 100, remaining_byte_quota: 20 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("byte_quota_status")).toEqual('danger');
      expect(user_stats.model.get("limits_space_exceeded")).toEqual("space");
    });

    it("should generate the space quota status message when the user reached the limit", function() {
      var user_stats = generateUserStats({ account_type: "FREE", username: "dev", byte_quota: 100, remaining_byte_quota: 0 });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("byte_quota_status")).toEqual('boom');
      expect(user_stats.model.get("limits_space_exceeded")).toEqual("space");
    });

  });

  describe("mapviews quota", function() {

    it("should generate the mapviews quota status message", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 100, account_type: "FREE", username: "dev", api_calls_quota: 1000, api_calls: [0, 0, 40, 0, 40] });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("mapviews_quota_status")).toEqual('');
    });

    it("should generate the mapviews quota status message for users withouth quota", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 100, account_type: "FREE", username: "dev", api_calls_quota: 0, api_calls: [0, 0, 40, 0, 40] });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("mapviews_quota_status")).toEqual('green');
    });

    it("should generate the mapviews quota status message when the user is about to reach the limit", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 100, account_type: "FREE", username: "dev", api_calls_quota: 100, api_calls: [0, 0, 40, 0, 40] });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("mapviews_quota_status")).toEqual("danger");
      expect(user_stats.model.get("limits_mapviews_exceeded")).toEqual("mapviews");
    });

    it("should generate the mapviews quota status message when the user reached the limit", function() {
      var user_stats = generateUserStats({ remaining_byte_quota: 100, account_type: "FREE", username: "dev", api_calls_quota: 80, api_calls: [0, 0, 40, 0, 40] });
      user_stats._calculateQuotas();
      expect(user_stats.model.get("mapviews_quota_status")).toEqual("boom");
      expect(user_stats.model.get("limits_mapviews_exceeded")).toEqual("mapviews");
    });

  });

});
