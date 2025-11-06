'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import EmailGenerator from '@/components/EmailGenerator'
import Inbox from '@/components/Inbox'
import PopularArticles from '@/components/PopularArticles'
import Footer from '@/components/Footer'

export default function Home() {
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  const [emailToken, setEmailToken] = useState<string | null>(null)

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 dark:text-white text-gray-900">
              TempusMail
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Generate temporary email addresses instantly
            </p>
          </div>

          <EmailGenerator 
            onEmailGenerated={(email, token) => {
              setCurrentEmail(email)
              setEmailToken(token)
            }}
          />

          {currentEmail && emailToken && (
            <Inbox email={currentEmail} token={emailToken} />
          )}

          <PopularArticles />
        </div>
      </div>
      <Footer />
    </main>
  )
}

