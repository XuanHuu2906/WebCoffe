import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  Avatar,
  Paper,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
// Removed @mui/lab Timeline components due to dependency conflicts
import {
  Coffee,
  Star,
  ExpandMore,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from a CMS or API
  const milestones = [
    { year: '2021', title: 'Thành lập & khai trương', description: 'XXây dựng phong cách hiện đại cổ điển, ra mắt menu cơ bản' },
    { year: '2022', title: 'Ổn định hoạt động', description: 'B ổ sung menu mới, hình thành khách hàng thân thiết' },
    { year: '2023', title: 'Quảng bá thương hiệu', description: 'Truyền thông online, tổ chức sự kiện nhỏ, tạo dấu ấn văn hóa. Hoạt động “Ly cafe sáng tạo” được đông đảo khách hàng hưởng ứng tích cực. Từ đó, thương hiệu được biết đến nhiều hơn' },
    { year: '2024', title: 'Đổi mới dịch vụ', description: 'Nâng cấp không gian, triển khai đặt hàng online, thẻ thành viên. Best seller thay đổi theo từng mùa nhưng “Cafe cốt dừa” vẫn chễm chệ chiếm một vị trí Top 1 không đổi' },
    { year: '2025', title: 'Khẳng định thương hiệu', description: 'HHát triển bền vững, hướng tới mở rộng chuỗi cửa hàng tại khu vực TP. HCM' }
  ];

  const coreValues = [
    'Chất lượng xuất sắc',
    'Thương mại công bằng',
    'Phát triển bền vững',
    'Cộng đồng gắn kết',
    'Minh bạch & tin cậy',
    'Đổi mới sáng tạo'
  ];

  const faqs = [
    {
      question: 'DREAM COFFEE là gì?',
      answer: 'DREAM COFFEE là một quán cà phê chuyên nghiệp, cung cấp những hạt cà phê chất lượng cao, cung cấp nguyên liệu từ những người nông dân uy tín. Chúng tôi cam kết mang đến cho khách hàng những trải nghiệm tuyệt vời nhất, từ những hạt cà phê thơm ngon đến những bữa tiệc đậm đà.'
    },
    {
      question: 'Dịch vụ nào DREAM COFFEE mang lại?',
      answer: 'DREAM COFFEE mang lại nhiều dịch vụ khác nhau, bao gồm: Cà phê, Sinh tố, Smoothie, Trà, Nước ép, Nước chanh, Nước mắm, Nước ép dừa, Nước ép cà phê, Nước ép cà phê dừa, Nước ép cà phê dừa chanh, Nước ép cà phê dừa chanh mắm.'
    },
    {
      question: 'DREAM COFFEE có sử dụng hạt cà phê từ những người nông dân nào?',
      answer: 'DREAM COFFEE cam kết sử dụng hạt cà phê từ những người nông dân uy tín. Chúng tôi chọn lọc từng hạt cà phê theo tiêu chuẩn chất lượng, đảm bảo rằng mỗi hạt đều là nguồn gốc tự nhiên và không có bất kỳ lỗi nào trong quá trình phát triển.'
    },
    {
      question: 'DREAM COFFEE có đào tạo barista không?',
      answer: 'DREAM COFFEE cam kết đào tạo barista chuyên nghiệp, giúp khách hàng có thể thưởng thức những hạt cà phê thơm ngon nhất. Chúng tôi có đội ngũ barista giàu kinh nghiệm, có kiến thức sâu rộng về công nghệ pha chế cà phê, giúp khách hàng có thể thưởng thức những hạt cà phê thơm ngon nhất.'
    },
    {
      question: 'DREAM COFFEE có tổ chức sự kiện không?',
      answer: 'DREAM COFFEE cam kết tổ chức sự kiện chuyên nghiệp, mang đến cho khách hàng những trải nghiệm tuyệt vời nhất. Chúng tôi có đội ngũ tổ chức sự kiện giàu kinh nghiệm, có kiến thức sâu rộng về công nghệ tổ chức sự kiện, giúp khách hàng có thể thưởng thức những hạt cà phê thơm ngon nhất.'
    }
  ];

  return (
    <Box>
      {/* Brand Story Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Giới thiệu về DREAM COFFEE
        </Typography>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              Quán cà phê Dream là một điểm đến lý tưởng cho những ai yêu thích không gian vừa hiện đại vừa mang nét cổ điển tinh tế. Với thiết kế nội thất kết hợp giữa tông màu trầm ấm, ánh sáng dịu nhẹ và những chi tiết trang trí mang hơi hướng Châu Âu, Dream mang đến cảm giác thư giãn nhưng không kém phần sang trọng.
            </Typography>
            <Typography variant="body1" paragraph>
              Menu đồ uống đa dạng, đáp ứng mọi sở thích:
            </Typography>
            <Typography variant="body1" paragraph>
              - Cà phê: Từ espresso đậm đà, cappuccino béo ngậy đến cold brew mát lạnh, tất cả được pha chế từ những hạt cà phê chất lượng cao.
            </Typography>
            <Typography variant="body1" paragraph>
             - Smoothie & Sinh tố: Những ly sinh tố tươi mát, kết hợp từ trái cây tươi như dâu, chuối, xoài, mang đến sự sảng khoái và lành mạnh.
            </Typography>
            <Typography variant="body1" paragraph>
              - Trà trái cây: Trà hoa quả tươi với các hương vị như đào, vải, chanh dây, kết hợp cùng topping thạch trái cây giòn ngon, phù hợp cho mọi lứa tuổi.
            </Typography>
              <Typography variant="body1" paragraph>
                Dream không chỉ là nơi thưởng thức đồ uống, mà còn là không gian để bạn tận hưởng những khoảnh khắc thư giãn, trò chuyện cùng bạn bè hoặc làm việc trong một bầu không khí ấm cúng và đầy cảm hứng.
              </Typography>
            <Typography variant="body1" paragraph>
                Hãy đến với Dream, nơi mọi giấc mơ đều bắt đầu từ một ly cà phê!
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: 2 }}>
              {milestones.map((milestone, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    mt: 0.5, 
                    mr: 2,
                    flexShrink: 0
                  }} />
                  <Box>
                    <Typography variant="h6" color="primary">
                      {milestone.year}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milestone.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Mission, Vision & Values Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Mục đích của chúng tôi
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Coffee sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Sứ Mệnh
                </Typography>
                <Typography variant="body1">
                  Mang đến những trải nghiệm cà phê tuyệt vời kết nối cộng đồng, đồng thời đồng hành cùng nông nghiệp bền vững và xây dựng mối quan hệ thương mại công bằng trên toàn thế giới.
                  Chúng tôi không chỉ phục vụ cà phê, mà còn trao gửi những giá trị, yêu thương và sự sẻ chia trong từng tách cà phê.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Star sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Tầm Nhìn
                </Typography>
                <Typography variant="body1">
                  Trở thành điểm đến hàng đầu của những người yêu cà phê, nơi định hình tiêu chuẩn cho chất lượng, sự bền vững, và kết nối cộng đồng.
                  Chúng tôi khao khát xây dựng một hệ sinh thái cà phê nơi mọi người cùng thưởng thức, chia sẻ và lan tỏa tình yêu với hạt cà phê Việt Nam ra khắp năm châu.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Group sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Giá Trị Cốt Lõi
                </Typography>
                <Box sx={{ textAlign: 'left' }}>
                  {coreValues.map((value, index) => (
                    <Chip key={index} label={value} sx={{ m: 0.5 }} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Câu hỏi thường gặp
        </Typography>
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default About;