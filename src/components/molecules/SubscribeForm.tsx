import { Envelope } from '@phosphor-icons/react'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { NewsletterTexts } from '../particles/DataLists'

export const SubscribeForm = () => {
    return (
        <form className='flex md:flex-row flex-col items-stretch gap-2'>
            <Input 
                type="email" 
                placeholder={NewsletterTexts.placeholderText}
                leftIcon={<Envelope size={18} weight="fill" />}
                className='border-none rounded-lg outline-none w-[300px] h-[50px] focus:outline-none text-color3'
                fullWidth={false}
            />
            <Button type='submit' className='border-none outline-none bg-color1 py-2 px-6 text-white font-light text-base rounded-lg hover:bg-secondary'>
                {NewsletterTexts.buttonText}
            </Button>
        </form>
    )
}
