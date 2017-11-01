import React, { Component } from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';

import Dot from './Dot';

export default class Pagination extends Component {
  static propTypes = {
    total: React.PropTypes.number,
    activeIndex: React.PropTypes.number,
    style: ViewPropTypes.style,
    horizontal: React.PropTypes.bool,
    dotStyle: ViewPropTypes.style,
    dotColor: React.PropTypes.string,
    activeDotStyle: ViewPropTypes.style,
    activeDotColor: React.PropTypes.string,
  };

  static defaultProps = {
    total: 0,
    activeIndex: -1,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      total,
      activeIndex,
      style,
      horizontal,
      dotColor,
      dotStyle,
      activeDotStyle,
      activeDotColor,
    } = this.props;
    const dot = <Dot />;
    const pagination = [];
    const paginationStyle = [
      styles['pagination_' + (horizontal ? 'x' : 'y')],
      style,
    ];

    for (let i = 0; i < total; i++) {
      let dStyle = [dotStyle, dotColor && { backgroundColor: dotColor }];

      if (i == activeIndex) {
        dStyle.push(
          activeDotStyle,
          activeDotColor && { backgroundColor: activeDotColor },
        );
      }

      pagination.push(React.cloneElement(dot, { key: i, style: dStyle }));
    }

    return (
      <View style={paginationStyle}>
        {pagination}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
