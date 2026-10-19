import SpecialGreetingTemplate from '../../components/SpecialGreetingTemplate';

export default function Page1311() {
  return (
    <SpecialGreetingTemplate
      code="1311"
      flower={{
        name: 'Bó Hoa Tulip Tinh Khôi',
        gardenTitle: 'VƯỜN TULIP YÊU THƯƠNG',
        image: '/flowers/tulip.jpg',
        meaning: 'Tượng trưng cho sự kiêu sa, niềm hứng khởi và vẻ đẹp thanh lịch bền bỉ theo năm tháng.',
      }}
      theme={{
        bgStyle: 'linear-gradient(135deg, #FFF7F3 0%, #F6E2E5 35%, #E9C4CF 70%, #D7B887 100%)',
        envelopeBg: 'rgba(255, 255, 255, 0.92)',
        envelopeBorder: 'border-[#E9C4CF]',
        sealOuter: 'from-[#D7B887] via-[#E9C4CF] to-[#F6E2E5]',
        sealInner: 'from-[#831843] to-[#be185d]',
        accentColor: '#831843',
        textColor: 'text-[#4c0519]',
        textMuted: 'text-[#831843]/80',
        cardBg: 'bg-white/95',
        cardBorder: 'border-[#E9C4CF]',
        cardBgColor: '#FFFFFF',
        cardTitleColor: '#701a3d',
        cardBodyColor: '#3d1222',
        cardAccentColor: '#be185d',
        fireworkColors: ['#db2777', '#f43f5e', '#fb7185', '#d7b887', '#e9c4cf', '#ffffff'],
      }}
      fallbackMessage="Nhân ngày Phụ Nữ Việt Nam 20/10, chúc bạn luôn giữ trọn nụ cười rạng rỡ, ngập tràn sức khỏe, an nhiên và gặt hái thật nhiều thành tựu mới trong sự nghiệp cũng như cuộc sống. Cảm ơn bạn vì sự tận tâm, nguồn năng lượng tích cực và những giá trị tuyệt vời mà bạn luôn mang lại."
    />
  );
}
