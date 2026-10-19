import SpecialGreetingTemplate from '../../components/SpecialGreetingTemplate';

export default function Page0607() {
  return (
    <SpecialGreetingTemplate
      code="0607"
      flower={{
        name: 'Bó Hoa Hướng Dương Rạng Rỡ',
        gardenTitle: 'VƯỜN HƯỚNG DƯƠNG TỎA NẮNG',
        image: '/flowers/huongduong.jpg',
        meaning: 'Tượng trưng cho nguồn năng lượng tích cực, sự ấm áp và luôn hướng về những điều tốt đẹp.',
      }}
      theme={{
        bgStyle: 'linear-gradient(135deg, #FFF4DF 0%, #E9D5B5 35%, #C9D7C2 70%, #A9BEA0 100%)',
        envelopeBg: 'rgba(255, 255, 255, 0.92)',
        envelopeBorder: 'border-[#E9D5B5]',
        sealOuter: 'from-[#A9BEA0] via-[#C9D7C2] to-[#E9D5B5]',
        sealInner: 'from-[#b45309] to-[#d97706]',
        accentColor: '#78350f',
        textColor: 'text-[#451a03]',
        textMuted: 'text-[#78350f]/80',
        cardBg: 'bg-white/95',
        cardBorder: 'border-[#E9D5B5]',
        cardBgColor: '#FFFFFF',
        cardTitleColor: '#451a03',
        cardBodyColor: '#2b1404',
        cardAccentColor: '#b45309',
        fireworkColors: ['#f59e0b', '#d97706', '#a9bea0', '#c9d7c2', '#fde68a', '#ffffff'],
      }}
      fallbackMessage="Hướng dương luôn hướng về nơi có ánh sáng mặt trời rạng rỡ. Chúc bạn ngày 20/10 ngập tràn năng lượng tích cực, luôn nở nụ cười tươi tắn và đón nhận thật nhiều điều tuyệt vời trong cuộc sống."
    />
  );
}
