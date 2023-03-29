import Button from '@/components/Button'
import { useCollect } from '@/hooks/useCollect'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { toast } from 'react-toastify'
import Input from '@/components/Input'
import styled from 'styled-components'
import _Image from '@/components/Image'
import { useDispatch } from '@/redux/hooks'
import { toggleConfetti } from '@/redux/confetti'
import {
	Box,
	getPaletteColor,
	ResponsiveSpacing,
	Text,
	UnstyledButton,
} from '@/compound'
import { CheckmarkCircle } from '@styled-icons/ionicons-solid'
import { getConfig } from '@/config'
import { useQuery } from 'react-query'
import { PopulatedMemento, TMemento } from '@/models/Memento'
import { GetCheckoutSession, GetClaim, GetProductPrice } from '@/types'
import { PopulatedClaim, TClaim } from '@/models/Claim'
import { AlwaysSquare } from '@/components/AlwaysSquare'
import { createPopupWindow } from '@/utils/createPopupWindow'
import moment from 'moment'
import pluralize from 'pluralize'

export const EmbededMintCollectionPage = ({
	claims,
	memento,
}: {
	memento: PopulatedMemento
	claims: PopulatedClaim[]
}) => {
	const router = useRouter()
	const dispatch = useDispatch()
	const {
		handleInputChange,
		collectMemento,
		input: { email, name },
		loading: loadingCollect,
		error,
		claim,
	} = useCollect()

	const { mementoId } = router.query as { mementoId: string }

	const daysLeft = useMemo(() => {
		if (memento?.endDate) {
			return Math.max(moment(memento?.endDate).diff(moment(), 'days'), 0)
		}
	}, [memento])

	const onCollect = async () => {
		if (!memento) return
		try {
			const { claim } = await collectMemento(mementoId, memento)

			if (claim) {
				dispatch(toggleConfetti(true))
				toast.success('Collected!')
			}
		} catch (e: any) {
			console.error(e)
			toast.error('Error collecting memento')
		}
	}

	const { data: priceData } = useQuery(
		['product', memento?.productId],
		() => {
			return getConfig().api.get<GetProductPrice.ResponseData>(
				`/api/product/${memento?.productId}/price`
			)
		},
		{ enabled: !!memento?.productId }
	)

	const price = useMemo(
		() =>
			priceData?.price?.unit_amount
				? priceData?.price?.unit_amount / 100
				: null,
		[priceData]
	)

	return (
		<Container>
			<CollectionCard>
				<ImageContainer>
					<Image
						src={memento?.metadata?.mediaUrl}
						alt={'Media'}
						objectFit="contain"
					/>
					{claim && (
						<ClaimedBadge>
							<CheckmarkCircle size={13} />
							Collected
						</ClaimedBadge>
					)}
				</ImageContainer>

				{!claim && (
					<InfoContainer>
						<Left>
							<Title>
								{memento ? memento?.metadata?.title : <Skeleton width="96px" />}
							</Title>
							<Creator>
								{memento?.user?.name
									? memento?.user?.name
									: 'Anonymous creator'}
							</Creator>
						</Left>
						<Right>
							<Supply>
								{memento ? (
									`${claims.length} / ${memento?.editionSize || '∞'} collected`
								) : (
									<Skeleton width="80px" />
								)}{' '}
							</Supply>
							<Date>
								{daysLeft != null
									? `${daysLeft} ${pluralize('day', daysLeft)} remaining`
									: ``}
							</Date>
						</Right>
					</InfoContainer>
				)}

				{claim ? (
					<ClaimNotice>
						<Text align="center">Collected {memento?.name}</Text>
						<Text fontColor="text-muted" align="center">
							{`As a collector, you’ll receive early access when ${memento?.user?.name} has new releases.`}{' '}
						</Text>
					</ClaimNotice>
				) : (
					<InputContainer>
						<Input
							action={handleInputChange('name')}
							placeholder="Name"
							type={'text'}
							value={name}
						/>
						<Input
							action={handleInputChange('email')}
							placeholder="Email address"
							type={'text'}
							value={email}
						/>
					</InputContainer>
				)}
				{!claim ? (
					<Button
						text={price ? `COLLECT - $${price} USD` : 'COLLECT'}
						type="primary"
						action={onCollect}
						loading={loadingCollect}
					/>
				) : (
					<ButtonContainer>
						<ShareButton
							onClick={() => {
								if (!memento) return

								const url = `https://twitter.com/intent/tweet?original_referer=${encodeURIComponent(
									'https://memento.supply'
								)}&text=Collect%20${encodeURIComponent(
									memento?.name as string
								)}%20on&url=${encodeURIComponent(
									getConfig().navigation.getCollectionRoute(memento, {
										withBaseUrl: true,
									})
								)}`
								createPopupWindow(url, 'Share to Twitter', '730', '480')
							}}
						>
							Share to twitter
						</ShareButton>
						<ShareButton
							onClick={() => {
								if (!memento) return
								navigator.clipboard.writeText(
									getConfig().navigation.getCollectionRoute(memento, {
										withBaseUrl: true,
									})
								)
								toast.success('Copied collect link')
							}}
						>
							Copy link to share
						</ShareButton>
					</ButtonContainer>
				)}
				{error && (
					<Text fontSize={14} fontColor="error-fg" align="center" spacing="pv2">
						{error}
					</Text>
				)}

				{!claim && (
					<Text
						fontColor="text-muted"
						fontSize={14}
						align="center"
						lineHeight="1.4"
						spacing={['pv4', 'ph4']}
					>
						{`Collect to receive early access when ${memento?.user?.name} has new releases.`}
					</Text>
				)}
			</CollectionCard>
		</Container>
	)
}

const Container = styled.div`
	margin: 0 auto;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	background: unset;
	width: 100vw;
	overflow: hidden;
`
const ImageContainer = styled(AlwaysSquare)`
	border: 1px solid ${getPaletteColor('border-color-lighter')};
	justify-content: center;
	margin-bottom: 32px;
	text-align: center;
	width: 343px;
	max-width: 100%;
	position: relative;
`

const InfoContainer = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 40px;
`

const Left = styled.div``

const Title = styled.div`
	font-weight: 500;
	margin-bottom: 2px;
`
const Creator = styled.div`
	color: ${getPaletteColor('text-muted')};
`

const Right = styled.div`
	text-align: right;
`

const Supply = styled.div`
	margin-bottom: 4px;
	flex-shrink: 0;
`

const Date = styled.div`
	color: ${getPaletteColor('text-muted')};
`

const Image = styled(_Image)`
	height: 100%;
	width: 100%;
	object-fit: contain;
`

const InputContainer = styled.div`
	margin-bottom: 16px;
	flex-direction: column;
	display: flex;
	gap: 16px;
`

const CollectionCard = styled.div`
	border: 1px solid ${getPaletteColor('border-color')};
	background-color: ${getPaletteColor('card-bg')};
	padding: 16px;
	max-width: 100%;
	width: 375px;
	min-height: 766px;
	margin: 0 auto;
`

const ClaimedBadge = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 4px 12px 4px 6px;
	gap: 6px;

	position: absolute;
	width: 106px;
	height: 25px;
	bottom: 16px;
	right: 16px;

	background: ${getPaletteColor('border-color')};
	border: 1px solid ${getPaletteColor('border-color')};
	backdrop-filter: blur(12px);
	border-radius: 24px;
`

const ClaimNotice = styled.div`
	flex-direction: column;
	padding: 16px;
	gap: 8px;
	margin-bottom: 36px;

	background: ${getPaletteColor('canvas-bg')};
	border: 1px solid rgba(23, 24, 26, 0.11);
`

const ShareButton = styled(UnstyledButton)`
	align-items: center;
	border: 1px solid ${getPaletteColor('border-color')};
	cursor: pointer;
	display: flex;
	height: 56px;
	font-weight: 500;
	justify-content: center;
	text-transform: uppercase;
	transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
	width: 100%;

	&:hover {
		border: 1px solid ${getPaletteColor('border-color-hover')};
	}
`

const ButtonContainer = styled.div`
	margin: 8px 0px;
	gap: 16px;
	display: flex;
	flex-direction: column;
`
