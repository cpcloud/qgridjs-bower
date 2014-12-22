(function() {
  var SecurityFilter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  quanto.SecurityFilter = SecurityFilter = (function(_super) {
    __extends(SecurityFilter, _super);

    function SecurityFilter($context_elem, field) {
      this.include_item = __bind(this.include_item, this);
      this.reset_filter = __bind(this.reset_filter, this);
      this.is_active = __bind(this.is_active, this);
      this.sort_comparer = __bind(this.sort_comparer, this);
      this.handle_filter_button_clicked = __bind(this.handle_filter_button_clicked, this);
      this.focus_on_search_box = __bind(this.focus_on_search_box, this);
      this.sort_if_needed = __bind(this.sort_if_needed, this);
      this.handle_selection_changed = __bind(this.handle_selection_changed, this);
      this.handle_grid_key_down = __bind(this.handle_grid_key_down, this);
      this.handle_grid_clicked = __bind(this.handle_grid_clicked, this);
      this.toggle_row_selected = __bind(this.toggle_row_selected, this);
      this.handle_text_input_key_up = __bind(this.handle_text_input_key_up, this);
      this.handle_text_input_click = __bind(this.handle_text_input_click, this);
      this.initialize_controls = __bind(this.initialize_controls, this);
      SecurityFilter.__super__.constructor.call(this, $context_elem, field);
      this.append_cash_row = false;
    }

    SecurityFilter.prototype.initialize_controls = function(sid_info_list) {
      var checkboxSelector, columns, cur_sid, name_formatter, options, security_filter, _i, _len, _ref;
      SecurityFilter.__super__.initialize_controls.call(this, sid_info_list);
      this.sid_infos = _.values(sid_info_list);
      this.search_string = "";
      if (this.append_cash_row) {
        this.sid_infos.push({
          name: "Cash",
          ticker: "Cash",
          sid: "Cash"
        });
      }
      _ref = this.sid_infos;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cur_sid = _ref[_i];
        cur_sid.id = cur_sid.sid;
      }
      this.data_view = new Slick.Data.DataView({
        inlineFilters: false,
        enableTextSelectionOnCells: true
      });
      security_filter = (function(_this) {
        return function(item, args) {
          if (_this.search_string != null) {
            if (item.ticker.toLowerCase().indexOf(_this.search_string.toLowerCase()) === -1 && item.name.toLowerCase().indexOf(_this.search_string.toLowerCase()) === -1 && item.sid.indexOf(_this.search_string) === -1) {
              return false;
            }
          }
          return true;
        };
      })(this);
      this.data_view.beginUpdate();
      this.data_view.setItems(this.sid_infos);
      this.data_view.setFilter(security_filter);
      this.data_view.sort(this.sort_comparer, true);
      this.data_view.endUpdate();
      name_formatter = (function(_this) {
        return function(row, cell, value, columnDef, dataContext) {
          if (dataContext.sid === "Cash") {
            return "<span class='label label-cash'>Cash</span>";
          } else {
            return "<span class='security-name'>" + (_.str.titleize(dataContext.name.toLowerCase())) + "</span> <small class='security-ticker'>" + (dataContext.ticker.toLowerCase()) + " (" + dataContext.sid + ")</small>";
          }
        };
      })(this);
      checkboxSelector = new Slick.CheckboxSelectColumn({
        cssClass: "check-box-cell"
      });
      columns = [
        checkboxSelector.getColumnDefinition(), {
          id: "name",
          name: "Name",
          field: "name",
          formatter: name_formatter,
          sortable: true,
          width: 400
        }
      ];
      options = {
        enableCellNavigation: true,
        fullWidthRows: true,
        syncColumnCellResize: true,
        rowHeight: 32,
        forceFitColumns: false,
        enableColumnReorder: false
      };
      this.security_grid = new Slick.Grid(this.$filter_elem.find(".text-filter-grid"), this.data_view, columns, options);
      this.security_grid.registerPlugin(checkboxSelector);
      this.security_grid.registerPlugin(new Slick.AutoTooltips());
      this.row_selection_model = new Slick.RowSelectionModel({
        selectActiveRow: false
      });
      this.row_selection_model.onSelectedRangesChanged.subscribe(this.handle_selection_changed);
      this.security_grid.setSelectionModel(this.row_selection_model);
      this.data_view.syncGridSelection(this.security_grid, true, true);
      this.security_grid.render();
      this.data_view.onRowCountChanged.subscribe((function(_this) {
        return function(e, args) {
          _this.security_grid.updateRowCount();
          return _this.security_grid.render();
        };
      })(this));
      this.data_view.onRowsChanged.subscribe((function(_this) {
        return function(e, args) {
          _this.security_grid.invalidateRows(args.rows);
          return _this.security_grid.render();
        };
      })(this));
      this.$security_search = this.$filter_elem.find(".search-input");
      this.$security_search.keyup(this.handle_text_input_key_up);
      this.$security_search.click(this.handle_text_input_click);
      this.security_grid.onClick.subscribe(this.handle_grid_clicked);
      this.security_grid.onKeyDown.subscribe(this.handle_grid_key_down);
      return this.$filter_elem.find("a.select-all-link").click((function(_this) {
        return function(e) {
          var all_row_indices, all_rows, i, row, _j, _len1;
          _this.reset_filter();
          all_row_indices = [];
          all_rows = _this.data_view.getItems();
          for (i = _j = 0, _len1 = all_rows.length; _j < _len1; i = ++_j) {
            row = all_rows[i];
            all_row_indices.push(i);
          }
          _this.row_selection_model.setSelectedRows(all_row_indices);
          $(_this).trigger("filter_changed");
          return false;
        };
      })(this));
    };

    SecurityFilter.prototype.handle_text_input_click = function(e) {
      return this.security_grid.resetActiveCell();
    };

    SecurityFilter.prototype.handle_text_input_key_up = function(e) {
      var old_search_string;
      old_search_string = this.search_string;
      if (e.keyCode === 40) {
        this.security_grid.focus();
        this.security_grid.setActiveCell(0, 0);
        return;
      }
      if (e.keyCode === 13) {
        if (this.security_grid.getDataLength() > 0) {
          this.toggle_row_selected(0);
          this.$security_search.val("");
        }
      }
      this.search_string = this.$security_search.val();
      if (old_search_string !== this.search_string) {
        this.data_view.refresh();
        return this.sort_if_needed();
      }
    };

    SecurityFilter.prototype.toggle_row_selected = function(row_index) {
      var old_selected_rows, selected_rows;
      old_selected_rows = this.row_selection_model.getSelectedRows();
      selected_rows = old_selected_rows.filter(function(word) {
        return word !== row_index;
      });
      if (selected_rows.length === old_selected_rows.length) {
        selected_rows.push(row_index);
      }
      return this.row_selection_model.setSelectedRows(selected_rows);
    };

    SecurityFilter.prototype.handle_grid_clicked = function(e, args) {
      var active_cell;
      this.toggle_row_selected(args.row);
      active_cell = this.security_grid.getActiveCell();
      if (active_cell == null) {
        return e.stopImmediatePropagation();
      }
    };

    SecurityFilter.prototype.handle_grid_key_down = function(e, args) {
      var active_cell;
      active_cell = this.security_grid.getActiveCell();
      if (active_cell != null) {
        if (e.keyCode === 13) {
          this.toggle_row_selected(active_cell.row);
          return;
        }
        if (e.keyCode !== 40 && e.keyCode !== 38) {
          this.focus_on_search_box();
        } else if (active_cell.row === 0 && e.keyCode === 38) {
          this.focus_on_search_box();
          e.preventDefault();
        }
      }
    };

    SecurityFilter.prototype.handle_selection_changed = function(e, args) {
      var all_rows, row, row_index, rows, something_selected, _i, _j, _k, _len, _len1, _len2;
      all_rows = this.data_view.getItems();
      for (_i = 0, _len = all_rows.length; _i < _len; _i++) {
        row = all_rows[_i];
        if (this.data_view.getRowById(row.id) != null) {
          row.selected = false;
        }
      }
      rows = this.row_selection_model.getSelectedRows();
      if (rows.length > 0) {
        for (_j = 0, _len1 = rows.length; _j < _len1; _j++) {
          row_index = rows[_j];
          row = this.data_view.getItem(row_index);
          row.selected = true;
        }
      }
      this.filter_sid_list = {};
      something_selected = false;
      for (_k = 0, _len2 = all_rows.length; _k < _len2; _k++) {
        row = all_rows[_k];
        if (row.selected) {
          something_selected = true;
          this.filter_sid_list[row.id] = row.id;
        }
      }
      if (!something_selected) {
        this.filter_sid_list = null;
      }
      this.sort_needed = true;
      return $(this).trigger("filter_changed");
    };

    SecurityFilter.prototype.sort_if_needed = function(force) {
      if (force == null) {
        force = false;
      }
      if (force || this.sort_needed) {
        this.data_view.sort(this.sort_comparer, true);
        return this.sort_needed = false;
      }
    };

    SecurityFilter.prototype.focus_on_search_box = function() {
      this.$security_search.focus().val(this.search_string);
      return this.security_grid.resetActiveCell();
    };

    SecurityFilter.prototype.handle_filter_button_clicked = function(e) {
      SecurityFilter.__super__.handle_filter_button_clicked.call(this, e);
      this.security_grid.setColumns(this.security_grid.getColumns());
      this.security_grid.resizeCanvas();
      this.sort_if_needed();
      this.focus_on_search_box();
      return false;
    };

    SecurityFilter.prototype.sort_comparer = function(x, y) {
      var x_value, y_value;
      x_value = x.name;
      y_value = y.name;
      if (x.selected !== y.selected) {
        if (x.selected) {
          return -1;
        } else {
          return 1;
        }
      }
      if (x.sid === "Cash") {
        return 1;
      }
      if (y.sid === "Cash") {
        return -1;
      }
      if (x_value > y_value) {
        return 1;
      } else {
        return -1;
      }
    };

    SecurityFilter.prototype.is_active = function() {
      return this.filter_sid_list != null;
    };

    SecurityFilter.prototype.reset_filter = function() {
      this.search_string = "";
      this.$security_search.val("");
      this.data_view.refresh();
      this.row_selection_model.setSelectedRows([]);
      this.sort_if_needed(true);
      return this.filter_sid_list = null;
    };

    SecurityFilter.prototype.include_item = function(item) {
      if (this.filter_sid_list != null) {
        if (this.filter_sid_list[item.sid] == null) {
          return false;
        }
      }
      return true;
    };

    return SecurityFilter;

  })(quanto.FilterBase);

}).call(this);
