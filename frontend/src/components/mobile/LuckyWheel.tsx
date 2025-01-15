import React, { useRef } from 'react';
import { LuckyWheel as Lucky } from '@lucky-canvas/react';
import { Toast, Modal } from 'antd-mobile';
import styles from './LuckyWheel.module.less';

interface Prize {
  id: number;
  name: string;
  probability: number;
}

interface LuckyWheelProps {
  prizes: Prize[];
  onStart: () => Promise<number>;
  disabled?: boolean;
  onEnd: (prize: any) => void;
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({
  prizes: originalPrizes,
  onStart,
  disabled = false,
  onEnd
}) => {
  const [showPrizes, setShowPrizes] = React.useState(false);
  const luckyRef = useRef<any>();

  // 转换奖品数据格式
  const blocks = [{ padding: '10px', background: '#1a1a1a' }];
  
  const prizes = originalPrizes.map(prize => ({
    name: prize.name.split('\n')[0],
    range: prize.probability,
    background: prize.id % 2 === 0 ? '#D4AF37' : '#F5DEB3',
    fonts: [{
      text: prize.name.split('\n')[0],
      top: '35%',
      fontSize: '12px',
      fontWeight: 'bold',
      lineHeight: '13px',
      wordWrap: true,  // 允许文字换行
      lengthLimit: '90%'  // 限制文字宽度
    }],
  }));  
  

  const buttons = [
    { radius: '40%', background: '#D4AF37' },
    { radius: '35%', background: '#1a1a1a' },
    {
      radius: '30%',
      background: '#D4AF37',
      pointer: true,
      fonts: [{
        text: '开始\n抽奖',
        top: '-50%',
        fontSize: '12px',
        fontWeight: 'bold',
        lineHeight: '18px'
      }]
    }
  ];

  const handleStart = async () => {
    if (disabled) {
      Toast.show({
        content: '您当前未使用的优惠券已达上限(3张),请先使用后再抽奖',
      });
      return;
    }

    try {
      luckyRef.current?.play();
      setTimeout(async () => {
        const result = await onStart();
        luckyRef.current?.stop(originalPrizes.findIndex(prize => prize.code === result));
      }, 2500);
    } catch(err) {
      luckyRef.current?.stop();
      Toast.show({
        icon: 'fail',
        content: '抽奖失败，请重试',
      });
    }
  };

  return (
    <div className={styles.luckyWheel}>
      <div className={styles.wheelContainer}>
        <Lucky
          ref={luckyRef}
          width="300px"
          height="300px"
          blocks={blocks}
          prizes={prizes}
          buttons={buttons}
          onEnd={onEnd}
          onStart={handleStart}
          defaultConfig={{
            gutter: 2,  // 扇形之间的间隔
            speed: 20,  // 旋转速度
            accelerationTime: 2500,  // 加速时间
            decelerationTime: 2500,  // 减速时间
            fontColor: '#1a1a1a',  // 文字颜色
            fontSize: '12px',  // 默认文字大小
            textAlign: 'center',  // 文字对齐方式
            lineHeight: '13px',  // 文字行高
            startAngle: 0,  // 开始角度
            offsetAngle: 0,  // 偏移角度
          }}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.prizeButton}
          onClick={() => setShowPrizes(true)}
        >
          查看奖品
        </button>
      </div>

      <Modal
        visible={showPrizes}
        onClose={() => setShowPrizes(false)}
        content={
          <div className={styles.prizeList}>
            <div className={styles.title}>奖品列表</div>
            <div className={styles.items}>
              {originalPrizes.map((prize, index) => (
                <div key={index} className={styles.item}>
                  <div>{prize.name}</div>
                  <div className={styles.probability}>{prize.probability}%</div>
                </div>
              ))}
            </div>
          </div>
        }
        closeOnMaskClick
        showCloseButton
      />
    </div>
  );
};

export default LuckyWheel; 