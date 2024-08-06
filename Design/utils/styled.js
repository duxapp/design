
export const getStyleForm = (...types) => {

  return Object.fromEntries(
    types.map(type => Object.keys(group[type]).map(key => [key, group[type][key]])).flat()
  )
}

const group = {
  size: {
    _size: {
      __group: {
        name: '尺寸'
      },
      width: {
        name: '宽度',
        type: 'size'
      },
      height: {
        name: '高度',
        type: 'size'
      },
      minWidth: {
        name: '最小宽',
        type: 'size'
      },
      minHeight: {
        name: '最小高',
        type: 'size'
      },
      maxWidth: {
        name: '最大宽',
        type: 'size'
      },
      maxHeight: {
        name: '最大高',
        type: 'size'
      }
    }
  },
  padding: {
    _padding: {
      __group: {
        name: '内边距'
      },
      padding: {
        name: '内边距',
        type: 'fourStyle',
        props: {
          field: 'padding',
          type: 'size',
          fields: [
            {
              field: 'paddingTop',
              name: '上'
            },
            {
              field: 'paddingBottom',
              name: '下'
            },
            {
              field: 'paddingLeft',
              name: '左'
            },
            {
              field: 'paddingRight',
              name: '右'
            }
          ]
        }
      }
    }
  },
  margin: {
    _margin: {
      __group: {
        name: '外边距'
      },
      margin: {
        name: '外边距',
        type: 'fourStyle',
        props: {
          type: 'size',
          field: 'margin',
          fields: [
            {
              field: 'marginTop',
              name: '上'
            },
            {
              field: 'marginBottom',
              name: '下'
            },
            {
              field: 'marginLeft',
              name: '左'
            },
            {
              field: 'marginRight',
              name: '右'
            }
          ]
        }
      }
    },
  },
  borderRadius: {
    _borderRadius: {
      __group: {
        name: '圆角'
      },
      borderRadius: {
        name: '圆角',
        type: 'fourStyle',
        props: {
          type: 'size',
          field: 'borderRadius',
          fields: [
            {
              field: 'borderTopLeftRadius',
              name: '左上'
            },
            {
              field: 'borderTopRightRadius',
              name: '右上'
            },
            {
              field: 'borderBottomLeftRadius',
              name: '左下'
            },
            {
              field: 'borderBottomRightRadius',
              name: '右下'
            }
          ]
        }
      }
    },
  },
  border: {
    _border: {
      __group: {
        name: '边框'
      },
      borderStyle: {
        name: '边框样式',
        type: 'radio',
        props: {
          options: [
            { name: '实线', value: 'solid' },
            { name: '虚线', value: 'dashed' },
            { name: '点状虚线', value: 'dotted' }
          ]
        }
      },
      borderColor: {
        name: '边框颜色',
        type: 'fourStyle',
        props: {
          type: 'color',
          field: 'borderColor',
          fields: [
            {
              field: 'borderTopColor',
              name: '上'
            },
            {
              field: 'borderBottomColor',
              name: '下'
            },
            {
              field: 'borderLeftColor',
              name: '左'
            },
            {
              field: 'borderRightColor',
              name: '右'
            }
          ]
        }
      },
      borderWidth: {
        name: '边框宽度',
        type: 'fourStyle',
        props: {
          type: 'size',
          field: 'borderWidth',
          fields: [
            {
              field: 'borderTopWidth',
              name: '上'
            },
            {
              field: 'borderBottomWidth',
              name: '下'
            },
            {
              field: 'borderLeftWidth',
              name: '左'
            },
            {
              field: 'borderRightWidth',
              name: '右'
            }
          ]
        }
      }
    }
  },
  flexParent: {
    _flexParent: {
      __group: {
        name: '父元素布局'
      },
      flexDirection: {
        name: '布局方向',
        type: 'radio',
        props: {
          options: [
            { name: '横', value: 'row' },
            { name: '竖', value: 'column' },
          ]
        }
      },
      flexWrap: {
        name: '自动换行',
        type: 'switch',
        show: ({ values }) => values.flexDirection === 'row'
      },
      gap: {
        name: '间距',
        type: 'size',
      },
      alignItems: {
        name: '布局方向对齐方式',
        type: 'radio',
        props: {
          options: [
            { name: '拉伸铺满', value: 'stretch' },
            { name: '开始', value: 'flex-start' },
            { name: '居中', value: 'center' },
            { name: '结束', value: 'flex-end' },
            { name: '基线对齐', value: 'baseline' },
          ]
        }
      },
      justifyContent: {
        name: '布局垂直方向对齐方式',
        type: 'radio',
        props: {
          options: [
            { name: '开始', value: 'flex-start' },
            { name: '居中', value: 'center' },
            { name: '结束', value: 'flex-end' },
            { name: '两端对齐', value: 'space-between' },
            { name: '平均对齐(around)', value: 'space-around' },
            { name: '平均对齐(evenly)', value: 'space-evenly' },
          ]
        }
      }
    }
  },
  flexChild: {
    _flexChild: {
      __group: {
        name: '子元素布局'
      },
      flex: {
        name: '拉伸比例',
        type: 'number',
      },
      flexShrink: {
        name: '弹性挤压',
        type: 'number',
      },
      alignSelf: {
        name: '自身在轴上的对齐方式',
        type: 'radio',
        props: {
          options: [
            { name: '拉伸铺满', value: 'stretch' },
            { name: '开始', value: 'flex-start' },
            { name: '居中', value: 'center' },
            { name: '结束', value: 'flex-end' },
            { name: '基线对齐', value: 'baseline' },
          ]
        }
      },
    }
  },
  position: {
    _position: {
      __group: {
        name: '定位'
      },
      position: {
        name: '定位方式',
        type: 'radio',
        props: {
          options: [
            { name: '相对定位', value: 'relative' },
            { name: '绝对定位', value: 'absolute' }
          ]
        }
      },
      top: {
        name: '上',
        type: 'size',
      },
      bottom: {
        name: '下',
        type: 'size',
      },
      left: {
        name: '左',
        type: 'size',
      },
      right: {
        name: '右',
        type: 'size',
      },
      zIndex: {
        name: '层级',
        type: 'number',
      }
    }
  },
  backgroundColor: {
    _backgroundColor: {
      __group: {
        name: '背景'
      },
      backgroundColor: {
        name: '背景颜色',
        type: 'color'
      }
    }
  },
  opacity: {
    _opacity: {
      __group: {
        name: '不透明度'
      },
      opacity: {
        name: '不透明度(0-1)',
        type: 'number'
      }
    }
  },
  overflow: {
    _overflow:{
      __group: {
        name: '内容裁剪'
      },
      overflow: {
        name: '内容裁剪',
        type: 'radio',
        props: {
          options: [
            { name: '不裁剪', value: undefined },
            { name: '裁剪', value: 'hidden' }
          ]
        }
      }
    }
  },
  transform: {
    // 变换
    _transform: {
      __group: {
        name: '变换'
      },
      transformOrigin: {
        __object: true,
        _transformOrigin: {
          __group: {
            name: '变换原点',
          },
          x: {
            name: 'X',
            type: ['radio', 'size'],
            props: [
              {
                options: [
                  { name: '左', value: 'left' },
                  { name: '中', value: 'center' },
                  { name: '右', value: 'right' },
                ]
              },
              {
                percentage: true
              }
            ]
          },
          y: {
            name: 'Y',
            type: ['radio', 'size'],
            props: [
              {
                options: [
                  { name: '上', value: 'top' },
                  { name: '中', value: 'center' },
                  { name: '下', value: 'bottom' },
                ]
              },
              {
                percentage: true
              }
            ]
          },
          z: {
            name: 'Z',
            type: 'size'
          }
        }
      },
      transform: {
        __object: true,
        _translate: {
          __group: {
            name: '平移'
          },
          translateX: {
            name: 'X',
            type: 'size'
          },
          translateY: {
            name: 'Y',
            type: 'size'
          },
        },
        _scale: {
          __group: {
            name: '缩放'
          },
          scaleX: {
            name: 'X',
            type: 'number',
            props: {
              suffix: '倍'
            }
          },
          scaleY: {
            name: 'Y',
            type: 'number',
            props: {
              suffix: '倍'
            }
          },
        },
        _rotate: {
          __group: {
            name: '旋转'
          },
          rotateX: {
            name: 'X',
            type: 'number',
            props: {
              suffix: '度',
              unit: 'deg'
            }
          },
          rotateY: {
            name: 'Y',
            type: 'number',
            props: {
              suffix: '度',
              unit: 'deg'
            }
          },
          rotateZ: {
            name: 'Z',
            type: 'number',
            props: {
              suffix: '度',
              unit: 'deg'
            }
          },
        },
        _skew: {
          __group: {
            name: '斜切'
          },
          skewX: {
            name: 'X',
            type: 'number',
            props: {
              suffix: '度',
              unit: 'deg'
            }
          },
          skewY: {
            name: 'Y',
            type: 'number',
            props: {
              suffix: '度',
              unit: 'deg'
            }
          },
        },
        _perspective: {
          __group: {
            name: '三维透视'
          },
          perspective: {
            name: '三维透视',
            type: 'size'
          }
        }
      }
    }
  },
  text: {
    _text: {
      __group: {
        name: '文本样式'
      },
      color: {
        name: '颜色',
        type: 'color'
      },
      fontSize: {
        name: '字号',
        type: 'size'
      },
      lineHeight: {
        name: '行距',
        type: 'size'
      },
      fontWeight: {
        name: '加粗',
        type: 'switch',
        props: {
          data: {
            false: undefined,
            true: 'bold'
          }
        }
      },
      fontStyle: {
        name: '斜体',
        type: 'switch',
        props: {
          data: {
            false: undefined,
            true: 'italic'
          }
        }
      },
      letterSpacing: {
        name: '字间距',
        type: 'size'
      },
      textAlign: {
        name: '文本对齐',
        type: 'radio',
        props: {
          options: [
            { name: '居左', value: 'left' },
            { name: '居中', value: 'center' },
            { name: '居右', value: 'right' },
            { name: '两端对齐', value: 'justify' }
          ]
        }
      },
      textDecorationLine: {
        name: '装饰线',
        type: 'radio',
        props: {
          options: [
            { name: '下划线', value: 'underline' },
            { name: '删除线', value: 'line-through' }
          ]
        }
      }
    }
  }
}
