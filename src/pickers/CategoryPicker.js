/* eslint-disable react/destructuring-assignment,max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { TextInput, Picker, withModulesManager } from '@openimis/fe-core';
import _ from 'lodash';
import { fetchCategoryForPicker } from '../actions';

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class RawFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slug: '',
      categoryTitle: '',
    };
  }

  stateToFilters = () => {
    const filters = [];
    if (this.state.slug) {
      filters.push(`slug_Istartswith: "${this.state.slug}"`);
    }
    if (this.state.categoryTitle) {
      filters.push(`categoryTitle_Istartswith: "${this.state.categoryTitle}"`);
    }
    return filters;
  };

  _onChange = (a, v) => {
    this.setState({ [a]: v }, (e) => this.props.onChange(this.stateToFilters()));
  };

  render() {
    const { classes } = this.props;
    return (
      <Grid container>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            autoFocus
            module="grievance"
            label="category.slug"
            value={this.state.slug}
            onChange={(v) => this._onChange('slug', v)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module="grievance"
            label="category.categoryTitle"
            value={this.state.categoryTitle}
            onChange={(v) => this._onChange('categoryTitle', v)}
          />
        </Grid>
      </Grid>
    );
  }
}

const Filter = withTheme(withStyles(styles)(RawFilter));

const INIT_STATE = {
  page: 0,
  pageSize: 10,
  afterCursor: null,
  beforeCursor: null,
  filters: [],
  selected: null,
};

class CategoryPicker extends Component {
  constructor(props) {
    super(props);
    this.state = INIT_STATE;
  }

  componentDidMount() {
    if (this.props.value) {
      this.setState((state, props) => ({ selected: props.value }));
    }
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((state, props) => ({
        ...INIT_STATE,
        selected: props.value,
      }));
    } else if (!_.isEqual(prevProps.value, this.props.value)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((state, props) => ({ selected: props.value }));
    }
  }

  formatSuggestion = (a) => (a ? `${a.categoryTitle} (${a.slug})` : '');

  filtersToQueryParams = () => {
    let prms = [...(this.props.forcedFilter || []), ...this.state.filters];
    prms = prms.concat(`first: ${this.state.pageSize}`);
    if (this.state.afterCursor) {
      prms = prms.concat(`after: "${this.state.afterCursor}"`);
    }
    if (this.state.beforeCursor) {
      prms = prms.concat(`before: "${this.state.beforeCursor}"`);
    }
    return prms;
  };

  getSuggestions = (filters) => {
    this.setState(
      { filters },
      () => this.props.fetchCategoryForPicker(this.props.modulesManager, this.filtersToQueryParams()),
    );
  };

  debouncedGetSuggestion = _.debounce(
    this.getSuggestions,
    this.props.modulesManager.getConf('fe-grievance', 'debounceTime', 800),
  );

  onChangeRowsPerPage = (cnt) => {
    this.setState(
      {
        pageSize: cnt,
        page: 0,
        afterCursor: null,
        beforeCursor: null,
      },
      () => this.props.fetchCategoryForPicker(this.props.modulesManager, this.filtersToQueryParams()),
    );
  };

  onSelect = (v) => {
    this.setState({ selected: v }, this.props.onChange(v, this.formatSuggestion(v)));
  };

  onChangePage = (page, nbr) => {
    if (nbr > this.state.page) {
      this.setState(
        (state, props) => ({
          page: state.page + 1,
          beforeCursor: null,
          afterCursor: props.categoryPageInfo.endCursor,
        }),
        () => this.props.fetchCategoryForPicker(this.props.modulesManager, this.filtersToQueryParams()),
      );
    } else if (nbr < this.state.page) {
      this.setState(
        (state, props) => ({
          page: state.page - 1,
          beforeCursor: props.categoryPageInfo.startCursor,
          afterCursor: null,
        }),
        () => this.props.fetchCategoryForPicker(this.props.modulesManager, this.filtersToQueryParams()),
      );
    }
  };

  render() {
    const {
      category,
      categoryPageInfo,
      readOnly = false,
      required = false,
      withLabel = true,
      IconRender = null,
      title,
      check,
      checked,
    } = this.props;
    return (
      <Picker
        module="grievance"
        label={withLabel ? 'category.label' : null}
        title={title}
        dialogTitle="category.picker.dialog.title"
        IconRender={IconRender}
        check={check}
        checked={checked}
        filter={<Filter onChange={this.debouncedGetSuggestion} />}
        suggestions={category}
        suggestionFormatter={this.formatSuggestion}
        page={this.state.page}
        pageSize={this.state.pageSize}
        count={categoryPageInfo.totalCount}
        onChangePage={this.onChangePage}
        onChangeRowsPerPage={this.onChangeRowsPerPage}
        onSelect={this.onSelect}
        value={this.state.selected}
        readOnly={readOnly}
        required={required}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  category: state.grievance.category,
  categoryPageInfo: state.grievance.categoryPageInfo,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchCategoryForPicker }, dispatch);

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(CategoryPicker)))),
);
