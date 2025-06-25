<template>
  <div class="disclaimer">
    <div class="container">
      <div class="disclaimer-content">
        <h1>免责声明</h1>
        <p class="intro">在使用本网站网盘搜索引擎（以下简称本网站）前，请您务必仔细阅读并透彻理解本声明。您可以自愿选择是否使用本网站，但如果您使用本网站，您的使用行为将被视为对本声明全部内容的认可。</p>

        <section>
          <h2>1. 本网站服务</h2>
          <p>本服务可向您提供与其他国际互联网上之网站或资源之链接。但是，您了解并明确知悉本网站无法控制这些网站及资源，因您使用或依赖任何由这些网站或资源发布的或经由这些网站或资源获得的任何内容、商品或服务所产生的任何损害或损失，我们无法对此承担任何直接或间接责任。</p>
        </section>

        <section>
          <h2>2. 搜索服务性质</h2>
          <p>鉴于本网站以非人工检索方式、根据您输入的关键字自动生成到第三方网页的链接，以便用户能够找到和使用第三方网站上各种文档、图片及其他所需内容。本网站本身不储存、复制、传播、控制编辑或修改被链接的第三方网站上的信息内容或其表现形式。对其概不负责，亦不承担任何法律责任。</p>
        </section>

        <section>
          <h2>3. 第三方资源</h2>
          <p>任何通过使用本网站而搜索链接到的第三方网站资源均系他人制作或提供，您可能从该第三方网站上获得资源及享用服务，本网站对其合法性概不负责，亦不承担任何法律责任。</p>
        </section>

        <section>
          <h2>4. 搜索结果立场</h2>
          <p>本网站搜索结果根据您键入的关键字自动搜索获得并生成，不代表本网站赞成被搜索链接到的第三方网站上的内容或立场。</p>
        </section>

        <section>
          <h2>5. 使用风险</h2>
          <p>您应该对使用本网站的结果自行承担风险。本网站不做任何形式的保证：</p>
          <ul>
            <li>不保证搜索结果满足您的要求</li>
            <li>不保证搜索服务不中断</li>
            <li>不保证搜索结果的安全性、正确性、及时性、合法性</li>
            <li>不保证由于您使用服务而获得的信息将是准确的或可靠的</li>
          </ul>
          <p>因网络状况、通讯线路、第三方网站等任何原因而导致您不能正常使用本网站，本网站不承担任何法律责任。</p>
        </section>

        <section>
          <h2>6. 知识产权保护</h2>
          <p>本网站高度重视知识产权保护，若本网站收录的第三方网页内容无意侵犯了您的权益，请提供相关有效书面证明首页添加联系方式，我们核实后单方面进行删改页面。详情请参见《版权说明》。</p>
        </section>

        <section>
          <h2>7. 个人隐私保护</h2>
          <p>本网站尊重并保护您的个人隐私权，本网站无注册会员、留言、评论、交易等交互功能，因此您的用户名、电子邮件地址、QQ号、微信号、证件号等一切个人资料不会被本网站所记录或储存，更不存在主动地泄露或以任何形式向任何第三方提供您个人资料的行为。但是，您了解并同意：您在使用搜索引擎时输入的关键字将不被认为是您的个人隐私资料。</p>
        </section>

        <section>
          <h2>8. 网站性质与监管</h2>
          <p>本网站是个非经营性个人网站，旨在方便用户查找学习资料，本网站坚决打击利用网盘及其搜索服务侵犯他人个人隐私和盗版等违法行为，本站对一些非法恶意的搜索进行了屏蔽，屏蔽的词库正在不断的扩大完善中。</p>
          <p>如您发现有任何不良信息，欢迎举报反馈给我们，我们将尽快处理。</p>
        </section>

        <section>
          <h2>9. 声明变更</h2>
          <p>本网站有权根据法律法规的变化以及网站运营状况随时修改本免责声明。修改后的声明会在本网站上公布，当发生争议时，以最新的声明文本为准。如果您不同意改动的内容，可以停止使用本网站提供的服务。如果您继续使用本网站提供的服务，则视为您接受本声明的变动。</p>
        </section>

        <section>
          <h2>10. 法律适用</h2>
          <p>本免责声明的解释、效力及纠纷的解决，适用于中华人民共和国法律。若您和本网站就本声明内容或其执行发生任何争议，应尽量友好协商解决；协商不成时，您同意将争议提交至本网站所在地有管辖权的人民法院解决。</p>
        </section>

        <div class="back-button">
          <button @click="goBack" class="btn-back">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.disclaimer {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.disclaimer-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
}

h1 {
  color: #e74c3c;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.2rem;
  font-weight: 600;
}

.intro {
  font-size: 1.1rem;
  color: #e67e22;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 500;
  background: #fef9e7;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #f39c12;
}

h2 {
  color: #2c3e50;
  margin: 30px 0 15px 0;
  font-size: 1.4rem;
  font-weight: 600;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 8px;
}

p {
  color: #555;
  margin-bottom: 15px;
  text-align: justify;
}

ul {
  margin: 15px 0;
  padding-left: 20px;
}

li {
  color: #555;
  margin-bottom: 8px;
}

section {
  margin-bottom: 35px;
}

strong {
  color: #e74c3c;
  font-weight: 600;
}

.back-button {
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e9ecef;
}

.btn-back {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-back:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .disclaimer-content {
    padding: 25px 20px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  h2 {
    font-size: 1.2rem;
  }
  
  .intro {
    font-size: 1rem;
    padding: 15px;
  }
}
</style>
