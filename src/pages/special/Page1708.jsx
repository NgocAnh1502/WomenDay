import SpecialGreetingTemplate from '../../components/SpecialGreetingTemplate';

export default function Page1708() {
  return (
    <SpecialGreetingTemplate
      code="1708"
      flower={{
        name: 'Bó Hoa Baby Dịu Dàng',
        gardenTitle: 'VƯỜN HOA BABY THUẦN KHIẾT',
        image: '/flowers/baby.jpg',
        meaning: 'Tượng trưng cho sự thuần khiết, nét dịu dàng và những điều bình yên, ngọt ngào nhất.',
      }}
      theme={{
        bgStyle: 'linear-gradient(135deg, #F8F1E8 0%, #E8D8C3 35%, #E8DDE0 70%, #C9D7C2 100%)',
        envelopeBg: 'rgba(255, 255, 255, 0.92)',
        envelopeBorder: 'border-[#C9D7C2]',
        sealOuter: 'from-[#C9D7C2] via-[#E8DDE0] to-[#E8D8C3]',
        sealInner: 'from-[#2d4a22] to-[#3f6230]',
        accentColor: '#2d4a22',
        textColor: 'text-[#1e3a1f]',
        textMuted: 'text-[#3f6230]/80',
        cardBg: 'bg-white/95',
        cardBorder: 'border-[#C9D7C2]',
        cardBgColor: '#FFFFFF',
        cardTitleColor: '#1e3a1f',
        cardBodyColor: '#1b261b',
        cardAccentColor: '#2d4a22',
        fireworkColors: ['#a3b18a', '#588157', '#e8d8c3', '#e8dde0', '#c9d7c2', '#ffffff'],
      }}
      fallbackMessage="Gửi tặng bạn những nhành hoa baby mong manh nhưng bền bỉ. Chúc bạn một ngày 20/10 ngập tràn niềm vui dịu nhẹ, luôn an yên trong tâm hồn và gặp nhiều may mắn trên con đường phía trước."
    />
  );
}
