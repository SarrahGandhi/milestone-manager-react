# 2026-03-26
Updated database so that a person can update their email in the families table. Update db to restrict getting the email and phone number so that we dont expose other peoples emails to the public
- Run
```
npx supabase start
npx supabase reset
```


Added a supabase edge function called `send-email` and that we can run locally 
- Create `.env.local` file under supabase folder same as the `.env.example`
- Create a API from resend and add that into the `.env.example` [link](https://resend.com/api-keys)
- Run to start function:
```
npx supabase functions serve --env-file supabase/.env.local 
```
- Function triggered:
```
`supabase.functions.invoke("send-email",...` in src/components/Pages/WeddingWebsite/Invite.jsx
```

