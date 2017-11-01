import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Animated, ViewPropTypes } from 'react-native';

import ViewPan from './ViewPan';
import Pagination from './Pagination';

export default class Swiper extends Component {
  /**
   * Props Validation
   * @type {Object}
   */
  static propTypes = {
    /**
     * 可选优化项。轮播图的高度（horizontal: false）或者宽度（horizontal: true）。
     */
    size: PropTypes.number,
    /**
     * 轮播的视图
     */
    children: PropTypes.node.isRequired,
    /**
     * <非受控组件>
     * 默认展现第 defaultIndex 个的视图 (从 0 开始)
     */
    defaultIndex: PropTypes.number,
    /**
     * 是否水平轮播
     */
    horizontal: PropTypes.bool,
    /**
     * 是否头尾衔接的循环轮播
     */
    isLoop: PropTypes.bool,
    /**
     * 是否自动轮播
     */
    autoPlay: PropTypes.bool,
    /**
     * 自动轮播的时间间隔。
     * 若该时间间隔设置的比动画时间还要短，组件会做出自动调整。
     */
    autoPlayTimeout: PropTypes.number,
    /**
     * 自动轮播的方向，默认(true)为水平为从左到右，垂直为从下到上；
     * false 则方向反方向轮播
     */
    autoPlayDirection: PropTypes.bool,
    /**
     * 自定义动画函数
     */
    animation: PropTypes.func,
    /**
     * 当前展现的视图变化前，触发该回调。回调参数为变化后的位置。
     * 注意，由于动画可能被中断。所以有 onChangeStart 不一定有 onChangeEnd
     */
    onChangeStart: PropTypes.func,
    /**
     * 当前展现的视图变化后，触发该回调。回调参数为变化后的位置。
     */
    onChangeEnd: PropTypes.func,
    /**
     *  展现轮播图的 Pagination
     */
    showsPagination: PropTypes.bool,
    /**
     *  Pagination 的样式
     */
    paginationStyle: ViewPropTypes.style,
    /**
     *  用户拖拽视图
     */
    onScrollEndDrag: PropTypes.func,
    /**
     *  如果用户在 item 中触发了 onPress 行为就不会进到这个逻辑中，
     *  修复用户在 Android 点击不灵敏的问题。
     */
    onPress: PropTypes.func,
  };

  /**
   * Default props
   * @return {object} props
   */
  static defaultProps = {
    size: null,
    defaultIndex: 0,
    horizontal: true,
    isLoop: true,
    autoPlay: true,
    autoPlayTimeout: 2500,
    autoPlayDirection: true,
    animation: function(animateValue, toValue) {
      return Animated.spring(animateValue, {
        toValue: toValue,
        friction: 12,
        tension: 50,
      });
    },
    showsPagination: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      size: props.size,
      activeIndex: props.defaultIndex,
    };
  }

  onWrapperLayout = ev => {
    const layout = ev.nativeEvent.layout;
    const size = this.props.horizontal ? layout.width : layout.height;

    if (size !== this.state.size) {
      this.setState({
        size,
      });
    }
  };

  _onChangeStart = activeIndex => {
    const { onChangeStart } = this.props;

    onChangeStart && onChangeStart(activeIndex);

    this.setState({
      activeIndex,
    });
  };

  render() {
    const {
      style,
      horizontal,
      children,
      onChangeStart,
      showsPagination,
      paginationStyle,
      dot,
      activeDot,
      dotStyle,
      dotColor,
      activeDotStyle,
      activeDotColor,
    } = this.props;
    const { size } = this.state;
    const stylesWrapper = horizontal ? styles.wrapper : styles.verticalWrapper;
    const total = React.Children.count(children);
    const _onChangeStart = showsPagination
      ? this._onChangeStart
      : onChangeStart;

    if (!size) {
      return (
        <View style={[style, stylesWrapper]} onLayout={this.onWrapperLayout} />
      );
    }

    return (
      <View style={[style, stylesWrapper]} onLayout={this.onWrapperLayout}>
        <ViewPan {...this.props} size={size} onChangeStart={_onChangeStart} />
        {showsPagination &&
          <Pagination
            dot={dot}
            activeDot={activeDot}
            total={total}
            activeIndex={this.state.activeIndex}
            horizontal={horizontal}
            style={paginationStyle}
            dotStyle={dotStyle}
            dotColor={dotColor}
            activeDotStyle={activeDotStyle}
            activeDotColor={activeDotColor}
          />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  verticalWrapper: {
    flexDirection: 'column',
  },
  item: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
