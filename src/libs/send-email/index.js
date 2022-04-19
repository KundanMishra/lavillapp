const nodemailer = require('nodemailer');
const env = require('../../configs/env');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(env.SENDGRID_API_KEY);




var transporter = nodemailer.createTransport({
    host: env.emailHost,
    port: 465,
    secure: true,
    auth: {
        user: env.emailUser,
        pass: env.emailPassword
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.sendEmail = (to,subject,content) => {
    return new Promise(async (resolve, reject) => {
        if(subject.includes('Your Booking is Confirmed')){

            const msg = {
                to: to,
                from: {
                    name: 'Lavilla Hospitality',
                    email: env.emailUser,
                }, 
                cc: to != "online@lavillahospitality.com" && "online@lavillahospitality.com",
                subject: subject,
                text:subject,
                html: `
                <div style="
                padding: 2rem 1rem;
                margin-bottom: 2rem; 
                border-radius: .3rem;
                ">
                    <div style="text-align: center;">
                        <img style="width:350px;height:auto" src="${env.apiEndpoint+'assets/images/logo.png'}" />
                    </div>
                    <br/> 
                    ${content}
                    <br />
    
                    <p style="text-align: center;">NEED HELP?</p>
    
                    <p style="text-align: center;">Please send your feedback to support@lavillahospitality.com</p>
    
                    <p style="text-align: center;">© La Villa Hospitality, KBH Building, 3RD Floor, Doha, Qatar.</p>
                    <div style="text-align: center;">
                        <div style="display: inline-flex;">
                            <div style="padding:5px">
                                <img style="width:22px;height:22px" src="${env.apiEndpoint+'assets/images/facebook.png'}" />
                            </div>
                            <div style="padding:5px">
                                <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/twitter.png'}" />
                            </div>
                            <div style="padding:5px">
                                <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/android.png'}" />
                            </div>
                            <div style="padding:5px">
                                <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/app-store.png'}" />
                            </div>
                        </div>
                    </div>
                </div>`,
            };
            
            sgMail.send(msg, (error, info) =>
                error ? reject({ error: "Cant verify the email account",err:error }) : resolve({ response: info })
            )
        }else{
            
            const msg = {
                to: to,
                from: {
                    name: 'Lavilla Hospitality',
                    email: env.emailUser,
                }, 
                subject: subject,
                text:subject,
                html: `
                <div style="
                padding: 2rem 1rem;
                margin-bottom: 2rem; 
                border-radius: .3rem;
                ">
                    <div style="text-align: center;">
                        <img style="width:350px;height:auto" src="${env.apiEndpoint+'assets/images/logo.png'}" />
                    </div>
                    <br/> 
                    ${content}
                    <br />

                    <p style="text-align: center;">NEED HELP?</p>

                    <p style="text-align: center;">Please send your feedback to support@lavillahospitality.com</p>

                    <p style="text-align: center;">© La Villa Hospitality, KBH Building, 3RD Floor, Doha, Qatar.</p>
                    <div style="text-align: center;">
                        <div style="display: inline-flex;">
                            <div style="padding:5px">
                                <img style="width:22px;height:22px" src="${env.apiEndpoint+'assets/images/facebook.png'}" />
                            </div>
                            <div style="padding:5px">
                                <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/twitter.png'}" />
                            </div>
                            <div style="padding:5px">
                                <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/android.png'}" />
                            </div>
                            <div style="padding:5px">
                                <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/app-store.png'}" />
                            </div>
                        </div>
                    </div>
                </div>`,
            };
            sgMail.send(msg, (error, info) =>
                error ? reject({ error: "Cant verify the email account",err:error }) : resolve({ response: info })
            )
        }
        // var mailOptions = {
        //     from: env.emailUser,
        //     to: to,
        //     subject: subject,
        //     html: `
        //     <div style="
        //     padding: 2rem 1rem;
        //     margin-bottom: 2rem; 
        //     border-radius: .3rem;
        //     ">
        //         <div style="text-align: center;">
        //             <img style="width:350px;height:auto" src="${env.apiEndpoint+'assets/images/logo.png'}" />
        //         </div>
        //         <br/> 
        //         ${content}
        //         <br />

        //         <p style="text-align: center;">NEED HELP?</p>

        //         <p style="text-align: center;">Please send your feedback to support@lavillahospitality.com</p>

        //         <p style="text-align: center;">© La Villa Hospitality, KBH Building, 3RD Floor, Doha, Qatar.</p>
        //         <div style="text-align: center;">
        //             <div style="display: inline-flex;">
        //                 <div style="padding:5px">
        //                     <img style="width:22px;height:22px" src="${env.apiEndpoint+'assets/images/facebook.png'}" />
        //                 </div>
        //                 <div style="padding:5px">
        //                     <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/twitter.png'}" />
        //                 </div>
        //                 <div style="padding:5px">
        //                     <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/android.png'}" />
        //                 </div>
        //                 <div style="padding:5px">
        //                     <img style="width:25px;height:25px" src="${env.apiEndpoint+'assets/images/app-store.png'}" />
        //                 </div>
        //             </div>
        //         </div>
        //     </div>` 
        // };
        // let verify = await transporter.verify();
        // console.log(verify);
        // if (verify) {
        //     let info = await transporter.sendMail(mailOptions);
        //     console.log(info);
        //     resolve({ response: info });
        // } else {
        //     reject({ error: "Cant verify the email account" });
        // }
    });
};












