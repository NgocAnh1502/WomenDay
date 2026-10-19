import SpecialGreetingTemplate from '../../components/SpecialGreetingTemplate';

export default function Page1207() {
  return (
    <SpecialGreetingTemplate
      code="1207"
      flower={{
        name: 'Bó Hoa Cẩm Tú Cầu Bình Yên',
        gardenTitle: 'VƯỜN HOA CẨM TÚ CẦU',
        image: '/flowers/camtucau.jpg',
        meaning: 'Tượng trưng cho sự chân thành, biết ơn và những xúc cảm trọn vẹn, thanh tao.',
      }}
      theme={{
        bgStyle: 'linear-gradient(135deg, #F5F1FA 0%, #DCD7EF 35%, #C9DCEB 70%, #E8DFF5 100%)',
        envelopeBg: 'rgba(255, 255, 255, 0.92)',
        envelopeBorder: 'border-[#DCD7EF]',
        sealOuter: 'from-[#C9DCEB] via-[#DCD7EF] to-[#E8DFF5]',
        sealInner: 'from-[#4338ca] to-[#6366f1]',
        accentColor: '#312e81',
        textColor: 'text-[#241852]',
        textMuted: 'text-[#4338ca]/80',
        cardBg: 'bg-white/95',
        cardBorder: 'border-[#DCD7EF]',
        cardBgColor: '#FFFFFF',
        cardTitleColor: '#241852',
        cardBodyColor: '#1b1834',
        cardAccentColor: '#4338ca',
        fireworkColors: ['#818cf8', '#a78bfa', '#c9dceb', '#e8dff5', '#60a5fa', '#ffffff'],
      }}
      fallbackMessage="Cẩm tú cầu tượng trưng cho sự gắn kết và lòng biết ơn chân thành. Nhân ngày 20/10, chúc bạn luôn giữ được sự an nhiên, hạnh phúc tròn đầy và từng ngày trôi qua đều là những thước phim dịu dàng."
    />
  );
}
