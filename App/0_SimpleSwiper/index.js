import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';

import SimpleSwiper from './SimpleSwiper'

export default class SimpleSwiperDemo extends Component {
    state={
        index: 1,
    }

    render() {
        return (
            <SimpleSwiper
                style={styles.swiper}
                index={this.state.index}
                onChange={(index)=> {
                    console.log(index)

                    this.setState({
                        index: index
                    })
                }}
            >
                <View style={[styles.item,styles.one]}>
                    <Text>one</Text>
                </View>
                <View style={[styles.item,styles.two]}>
                    <Text>two</Text>
                </View>
                <View style={[styles.item,styles.three]}>
                    <Text>three</Text>
                </View>
            </SimpleSwiper>
        );
    }
}

const styles = StyleSheet.create({
    swiper: {
        alignSelf:'center',
        marginVertical: 100,
        borderWidth: 2,
        borderColor: 'red',
        overflow:'visible',
        width: 100,
    },
    item : {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    one: {
        backgroundColor: '#0ca',
    },
    two: {
        backgroundColor: '#0cc',
    },
    three: {
        backgroundColor: '#0ac',
    },
});
